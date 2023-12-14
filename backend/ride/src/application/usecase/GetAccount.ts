import { AccountRepository } from "../repository/AccountRepository";

export class GetAccount {
  constructor(private accountRepository: AccountRepository) { }

  execute = async (accountId: string) => {
    const account = this.accountRepository.getById(accountId);
    return account;
  };
}