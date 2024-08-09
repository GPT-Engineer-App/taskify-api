import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const API_URL = 'http://localhost:3000/api/tasks'; // Replace with your actual API URL

const fetchTasks = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

const Index = () => {
  const [newTask, setNewTask] = useState('');
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  const createTaskMutation = useMutation({
    mutationFn: (newTask) => axios.post(API_URL, { title: newTask, completed: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewTask('');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (updatedTask) => axios.put(`${API_URL}/${updatedTask._id}`, updatedTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => axios.delete(`${API_URL}/${taskId}`),
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
