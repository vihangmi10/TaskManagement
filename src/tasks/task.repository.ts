import { DeleteResult, EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository');
  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { search, status, skip, take } = filterDto;
    const query = this.createQueryBuilder('task');

    query.where('task.userId = :userId', { userId: user.id });


    if(status) {
      query.andWhere('task.status = :status', { status });
    }

    if(search) {
      query.andWhere('(task.title LIKE :search or task.description LIKE :search)', { search: `%${search}%` });
    }

    if(skip) {
      query.skip(skip);
    }

    if(take) {
      query.take(take);
    }
    try {
      const tasks = await query.getMany(); // Simply to return all the tasks. But what if there are filters.
      return tasks;
    } catch(error) {
      this.logger.error(`Failed to get tasks for user ${user.username}, FILTERS: ${JSON.stringify(filterDto)}`, error.stack);
      throw new InternalServerErrorException()
    }

  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description, } = createTaskDto;

    const task = new Task();
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;
    try {
      await task.save();
    } catch(error) {
      this.logger.error(`Failed to create a task for user ${user.username} DATA: ${JSON.stringify(createTaskDto)}`, error.stack);
      throw new InternalServerErrorException();
    }

    delete task.user; // Once it is saved in the database. We can remove the user key and its corresponding value because we don't need to send it to front end.
    return task;
  }
}
