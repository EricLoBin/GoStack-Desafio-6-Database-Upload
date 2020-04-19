import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError("You don't have enouth balance.");
    }

    let categoryData = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryData) {
      categoryData = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryData);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryData.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
