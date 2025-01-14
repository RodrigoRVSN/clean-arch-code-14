import { DatabaseConnection } from "../src/infra/database/DatabaseConnection";
import { GetRide } from "../src/application/usecase/GetRide";
import { LoggerConsole } from "../src/infra/logger/LoggerConsole";
import { PgPromiseAdapter } from "../src/infra/database/PgPromiseAdapter";
import { RequestRide } from "../src/application/usecase/RequestRide";
import { RideRepositoryDatabase } from "../src/infra/repository/RideRepositoryDatabase";
import { AccountGatewayHttp } from "../src/infra/gateway/AccountGatewayHttp";

let requestRide: RequestRide;
let getRide: GetRide;
let databaseConnection: DatabaseConnection;
let accountGateway: AccountGatewayHttp

describe("Request ride", () => {
  beforeEach(() => {
    databaseConnection = new PgPromiseAdapter();
    const RideRepository = new RideRepositoryDatabase(databaseConnection);
    const logger = new LoggerConsole();
    accountGateway = new AccountGatewayHttp();
    requestRide = new RequestRide(RideRepository, accountGateway, logger);
    getRide = new GetRide(RideRepository, logger);
  });

  afterEach(() => {
    databaseConnection.close();
  });

  it("should be able to request a ride", async () => {
    const inputSignup = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "97456321558",
      isPassenger: true,
      password: "123456",
    };
    const outputSignup = await accountGateway.signup(inputSignup);
    const inputRequestRide = {
      passengerId: outputSignup.accountId,
      fromLat: -27.584905257808835,
      fromLong: -48.545022195325124,
      toLat: -27.496887588317275,
      toLong: -48.522234807851476,
    };
    const outputRequestRide = await requestRide.execute(inputRequestRide);
    expect(outputRequestRide.rideId).toBeDefined();
    const outputGetRide = await getRide.execute(outputRequestRide.rideId);
    expect(outputGetRide.status).toBe("requested");
  });

  it("should not be able to request a ride if the account doesn't exists", async () => {
    const inputRequestRide = {
      passengerId: "5fd82c60-ff7c-40d0-9bb8-f56d6836f1aa",
      fromLat: -27.584905257808835,
      fromLong: -48.545022195325124,
      toLat: -27.496887588317275,
      toLong: -48.522234807851476,
    };
    await expect(() => requestRide.execute(inputRequestRide)).rejects.toThrow(
      new Error("Account does not exists")
    );
  });

  it("should not be able to request a ride if the user is not a passenger", async () => {
    const inputSignup = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "97456321558",
      carPlate: "BBB1234",
      isPassenger: false,
      isDriver: true,
      password: "123456",
    };
    const outputSignup = await accountGateway.signup(inputSignup);
    const inputRequestRide = {
      passengerId: outputSignup.accountId,
      fromLat: -27.584905257808835,
      fromLong: -48.545022195325124,
      toLat: -27.496887588317275,
      toLong: -48.522234807851476,
    };
    await expect(() => requestRide.execute(inputRequestRide)).rejects.toThrow(
      new Error("Only passengers can request a ride")
    );
  });

  it("should not be able to request a ride if the user already have an active ride", async () => {
    const inputSignup = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "97456321558",
      isPassenger: true,
      password: "123456",
    };
    const outputSignup = await accountGateway.signup(inputSignup);
    const inputRequestRide = {
      passengerId: outputSignup.accountId,
      fromLat: -27.584905257808835,
      fromLong: -48.545022195325124,
      toLat: -27.496887588317275,
      toLong: -48.522234807851476,
    };
    await requestRide.execute(inputRequestRide);
    await expect(() => requestRide.execute(inputRequestRide)).rejects.toThrow(
      new Error("Passenger has an active ride")
    );
  });
});
