import { GetTransactionByRideId } from "../src/application/usecase/GetTransactionByRideId"
import { ProcessPayment } from "../src/application/usecase/ProcessPayment"
import { PgPromiseAdapter } from "../src/infra/database/PgPromiseAdapter"
import { TransactionRepositoryORM } from "../src/infra/repository/TransactionRepositoryORM"

it('should process a payment', async () => {
  const connection = new PgPromiseAdapter()
  const transactionRepository = new TransactionRepositoryORM(connection)
  const processPayment = new ProcessPayment(transactionRepository)
  const rideId = crypto.randomUUID()
  const inputProcessPayment = {
    rideId,
    creditCardToken: "123456789",
    amount: 1000
  }
  await processPayment.execute(inputProcessPayment)
  const getTransactionByRideId = new GetTransactionByRideId(transactionRepository)
  const output = await getTransactionByRideId.execute(rideId)
  console.log(output)
  await connection.close();
})