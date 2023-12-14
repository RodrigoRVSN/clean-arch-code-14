import { AcceptRide } from "../src/application/usecase/AcceptRide";
import { AccountRepositoryDatabase } from "../src/infra/repository/AccountRepositoryDatabase";
import { DatabaseConnection } from "../src/infra/database/DatabaseConnection";
import { GetRide } from "../src/application/usecase/GetRide";
import { LoggerConsole } from "../src/infra/logger/LoggerConsole";
import { PgPromiseAdapter } from "../src/infra/database/PgPromiseAdapter";
import { RequestRide } from "../src/application/usecase/RequestRide";
import { RideRepositoryDatabase } from "../src/infra/repository/RideRepositoryDatabase";
import { Signup } from "../src/application/usecase/Signup";
import { StartRide } from "../src/application/usecase/StartRide";
import { UpdatePosition } from "../src/application/usecase/UpdatePosition";
import { PositionRepositoryDatabase } from "../src/infra/repository/PositionRepositoryDatabase";

let signup: Signup;
let requestRide: RequestRide;
let getRide: GetRide;
let acceptRide: AcceptRide;
let startRide: StartRide;
let databaseConnection: DatabaseConnection;
let updatePosition: UpdatePosition;

describe("Update position", () => {
  beforeEach(() => {
    databaseConnection = new PgPromiseAdapter();
    const accountRepository = new AccountRepositoryDatabase(databaseConnection);
    const rideRepository = new RideRepositoryDatabase(databaseConnection);
    const positionRepository = new PositionRepositoryDatabase(
      databaseConnection
    );
    const logger = new LoggerConsole();
    signup = new Signup(accountRepository, logger);
    requestRide = new RequestRide(rideRepository, accountRepository, logger);
    acceptRide = new AcceptRide(rideRepository, accountRepository);
    startRide = new StartRide(rideRepository);
    updatePosition = new UpdatePosition(rideRepository, positionRepository);

    getRide = new GetRide(rideRepository, logger);
  });

  afterEach(() => {
    databaseConnection.close();
  });


  it("should be able to update the position", async () => {
    const inputSignupPassenger = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "97456321558",
      isPassenger: true,
      password: "123456",
    };
    const outputSignupPassenger = await signup.execute(inputSignupPassenger);
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      fromLat: -27.584905257808835,
      fromLong: -48.545022195325124,
      toLat: -27.496887588317275,
      toLong: -48.522234807851476,
    };
    const outputRequestRide = await requestRide.execute(inputRequestRide);
    const inputSignupDriver = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "97456321558",
      carPlate: "BBB1234",
      isPassenger: false,
      isDriver: true,
      password: "123456",
    };
    const outputSignupDriver = await signup.execute(inputSignupDriver);
    const inputAcceptRide = {
      rideId: outputRequestRide.rideId,
      driverId: outputSignupDriver.accountId,
    };
    await acceptRide.execute(inputAcceptRide);
    await startRide.execute(inputAcceptRide)
    const inputUpdateRide = {
      rideId: outputRequestRide.rideId,
      lat: -27.584905257808835,
      long: -48.545022195325124,
    };
    await updatePosition.execute(inputUpdateRide)
  });

  it("should not be able to update the position if the ride is not in progress", async () => {
    const inputSignupPassenger = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "97456321558",
      isPassenger: true,
      password: "123456",
    };
    const outputSignupPassenger = await signup.execute(inputSignupPassenger);
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      fromLat: -27.584905257808835,
      fromLong: -48.545022195325124,
      toLat: -27.496887588317275,
      toLong: -48.522234807851476,
    };
    const outputRequestRide = await requestRide.execute(inputRequestRide);
    const inputSignupDriver = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "97456321558",
      carPlate: "BBB1234",
      isPassenger: false,
      isDriver: true,
      password: "123456",
    };
    const outputSignupDriver = await signup.execute(inputSignupDriver);
    const inputAcceptRide = {
      rideId: outputRequestRide.rideId,
      driverId: outputSignupDriver.accountId,
    };
    await acceptRide.execute(inputAcceptRide);
    const inputUpdateRide = {
      rideId: outputRequestRide.rideId,
      lat: -27.584905257808835,
      long: -48.545022195325124,
    };
    await expect(() => updatePosition.execute(inputUpdateRide)).rejects.toThrow(
      "The ride is not in progress"
    );
  });
});