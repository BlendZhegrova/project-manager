// app/components/TaskListClient.tsx
'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// Type for task
interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  orderNumber: number;
  dueDate: string | null;
  createdAt: string;
}

export function TaskListClient({ tasks, projectId }: { tasks: Task[], projectId: number }) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [taskList, setTaskList] = useState(tasks);

  const filteredTasks = statusFilter === 'all'
    ? taskList
    : taskList.filter(task => task.status === statusFilter);

  const statuses = ['all', 'todo', 'in-progress', 'done'];

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    // Reorder tasks in the client state
    const reorderedTasks = Array.from(taskList);
    const [movedTask] = reorderedTasks.splice(source.index, 1);
    reorderedTasks.splice(destination.index, 0, movedTask);

    setTaskList(reorderedTasks);

    // Prepare updated order numbers to send to the backend
    const updatedOrderNumbers = reorderedTasks.map((task, index) => ({
      id: task.id,
      orderNumber: index + 1, // Order numbers start from 1
    }));

    try {
      for (const task of updatedOrderNumbers) {
        const response = await fetch(`/api/tasks/${task.id}/updateorder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderNumber: task.orderNumber }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update order for task ${task.id}`);
        }
      }
    } catch (error) {
      console.error(error);
      // Optionally, revert the changes if the update fails
      setTaskList(tasks);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {statuses.map((status) => (
          <button
            key={status}
            className={`px-3 py-1 rounded text-sm ${statusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setStatusFilter(status)}
          >
            {status.replace('-', ' ')}
          </button>
        ))}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks" direction="vertical" isDropDisabled={false}>
          {(provided, snapshot) => (
            <div
              className="space-y-3"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {filteredTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                  {(provided) => (
                    <div
                      className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{task.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${task.status === 'done' ? 'bg-green-100 text-green-800' : task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        {task.dueDate ? (
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        ) : (
                          <span>No due date</span>
                        )}
                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
