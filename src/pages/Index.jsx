import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2 } from "lucide-react";

// Mock API
let mockTasks = [
  { _id: '1', title: 'Learn React', completed: false },
  { _id: '2', title: 'Build a project', completed: true },
  { _id: '3', title: 'Deploy application', completed: false },
];

const fetchTasks = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTasks), 500);
  });
};

const Index = () => {
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
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
      setEditingTask(null);
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

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask(task.title);
  };

  const handleUpdateTask = (e) => {
    e.preventDefault();
    if (newTask.trim() && editingTask) {
      updateTaskMutation.mutate({ ...editingTask, title: newTask });
    }
  };

  const filteredTasks = tasks ? tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  }) : [];

  if (isLoading) return <div className="text-center mt-8">Loading tasks...</div>;
  if (isError) return <div className="text-center mt-8 text-red-500">Error fetching tasks</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Task Management System</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="flex gap-2">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter a task"
              className="flex-grow"
            />
            <Button type="submit">{editingTask ? 'Update' : 'Add'} Task</Button>
          </form>
        </CardContent>
      </Card>

      <div className="mb-4 flex justify-between items-center">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter tasks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="active">Active Tasks</SelectItem>
            <SelectItem value="completed">Completed Tasks</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-gray-500">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} {filter !== 'all' ? filter : ''}
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task._id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 flex-grow">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleComplete(task)}
                  id={`task-${task._id}`}
                />
                <label
                  htmlFor={`task-${task._id}`}
                  className={`${task.completed ? 'line-through text-gray-500' : ''} flex-grow`}
                >
                  {task.title}
                </label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEditTask(task)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteTask(task._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
