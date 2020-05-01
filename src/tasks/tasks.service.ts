import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';


@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ){}

  getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto, user);
  }
  async getTaskById(id: number, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({ where: { id, userId: user.id }});
    if(!found) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return found;
  }
  // Creating a task using Entity directly by-passing the persistent layer i.e. the repository.
  // async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
  //   const { title, description, } = createTaskDto;
  //
  //   const task = new Task();
  //   task.title = title;
  //   task.description = description;
  //   task.status = TaskStatus.OPEN;
  //   await task.save();
  //   return task;
  // }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async deleteTask(id: number, user: User): Promise<void> {
    const deleteResult = await this.taskRepository.delete({ id, userId: user.id });
    if(deleteResult.affected === 0) throw new NotFoundException(`Could not find the task with ${id} to delete`)
  }
  // async deleteTaskByRemoveMethod(id: number): Promise<Task> {
  //   const found = await this.getTaskById(id);
  //   return await this.taskRepository.remove(found);
  // }
  async updateTaskStatus(id: number, status: TaskStatus, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();
    return task;
  }

  // ----- THIS IS SPECIFICALLY USED FOR UNDERSTANDING THE CRUD OPERATIONS ON NON-PERSISTENCE DATA STORAGE IN THIS CASE AN ARRAY USED TO STORE TASKS. FOR PERSISTENCE STORAGE WE WON'T NEED THIS -----
  // private tasks: Task[] = [];
  //
  // getAllTasks(): Task[] {
  //   return this.tasks;
  // }
  // getTasksWithFilter(filterDto: GetTasksFilterDto): Task[] {
  //   const { status, search } = filterDto;
  //   let tasks = this.getAllTasks();
  //   if (status) {
  //     tasks = tasks.filter(task => task.status === status);
  //   }
  //   if (search) {
  //     tasks = tasks.filter(
  //       task =>
  //         task.title.includes(search) || task.description.includes(search),
  //     );
  //   }
  //
  //   return tasks;
  // }
  // getTaskById(id: string): Task {
  //   const found = this.tasks.find(task => task.id === id);
  //   if (!found) {
  //     throw new NotFoundException();
  //   }
  //   return found;
  // }
  // createTask(createTaskDto: CreateTaskDto): Task {
  //   const { title, description } = createTaskDto;
  //
  //   const task: Task = {
  //     id: uuidv4(),
  //     title,
  //     description,
  //     status: TaskStatus.OPEN,
  //   };
  //   this.tasks.push(task);
  //   return task;
  // }
  // updateTask(id: string, status: TaskStatus): Task {
  //   const task = this.getTaskById(id);
  //   task.status = status;
  //   return task;
  // }
  // deleteTask(id: string): void {
  //   const found = this.getTaskById(id);
  //   this.tasks = this.tasks.filter(task => task.id !== found.id);
  // }
}
