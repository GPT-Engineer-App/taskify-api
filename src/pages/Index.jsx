import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// Mock API
let mockTasks = [
  { _id: '1', title: 'Learn React', completed: false },
  { _id: '2', title: 'Build a project', completed: true },
];

const fetchTasks = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTasks), 500);
  });
};

const Index = () => {
  const [newTask, setNewTask] = useState('');
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  const createTaskMutation = useMutation({
    mutationFn: (newTask) => {
      const task = { _id: Date.now().toString(), title: newTask, completed: false };
      mockTasks = [...mockTasks, task];
      return Promise.resolve(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewTask('');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (updatedTask) => {
      mockTasks = mockTasks.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      );
      return Promise.resolve(updatedTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => {
      mockTasks = mockTasks.filter(task => task._id !== taskId);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      createTaskMutation.mutate(newTask);
    }
  };

  const handleToggleComplete = (task) => {
    updateTaskMutation.mutate({ ...task, completed: !task.completed });
  };

  const handleDeleteTask = (taskId) => {
    deleteTaskMutation.mutate(taskId);
  };

  if (isLoading) return <div className="text-center mt-8">Loading tasks...</div>;
  if (isError) return <div className="text-center mt-8 text-red-500">Error fetching tasks</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Task Management System</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter a new task"
              className="flex-grow"
            />
            <Button type="submit">Add Task</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task._id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleComplete(task)}
                  id={`task-${task._id}`}
                />
                <label
                  htmlFor={`task-${task._id}`}
                  className={`${task.completed ? 'line-through text-gray-500' : ''}`}
                >
                  {task.title}
                </label>
              </div>
              <Button variant="destructive" onClick={() => handleDeleteTask(task._id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
