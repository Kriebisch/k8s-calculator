import { jest } from "@jest/globals";

const mockAxiosPost = jest.fn();
const mockCalculationCreate = jest.fn();

jest.unstable_mockModule("axios", () => ({
  default: {
    post: mockAxiosPost,
  },
}));

jest.unstable_mockModule("@prisma/client", () => ({
  default: {
    PrismaClient: jest.fn(() => ({
      calculation: {
        create: mockCalculationCreate,
      },
      $disconnect: jest.fn(),
    })),
  },
}));

jest.unstable_mockModule("@prisma/adapter-pg", () => ({
  PrismaPg: jest.fn(),
}));

const { app, prisma, server } = await import("../index.js");
const request = (await import("supertest")).default;

afterAll(async () => {
  await prisma.$disconnect();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

beforeEach(() => {
  jest.clearAllMocks();

  mockAxiosPost
    .mockResolvedValueOnce({ data: { result: 10 } })
    .mockResolvedValueOnce({ data: { result: 5 } })
    .mockResolvedValueOnce({ data: { result: 50 } })
    .mockResolvedValueOnce({ data: { result: 10 } });

  mockCalculationCreate.mockResolvedValue({ id: 1, result: 10 });
});

test("POST /calculate returns the calculation results", async () => {
  const response = await request(app)
    .post("/calculate")
    .send({ num1: 5, num2: 5, num3: 8, num4: 3, num5: 5 });

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    additionResult: 10,
    subtractionResult: 5,
    multiplicationResult: 50,
    divisionResult: 10,
  });
});

test("POST /calculate returns 500 when a calculation service fails", async () => {
  mockAxiosPost.mockReset();
  mockAxiosPost.mockRejectedValue(new Error("Service unavailable"));

  const response = await request(app)
    .post("/calculate")
    .send({ num1: 5, num2: 5, num3: 8, num4: 3, num5: 5 });

  expect(response.status).toBe(500);
  expect(response.body).toEqual({
    error: "Fehler bei der Berechnung",
  });

  expect(mockCalculationCreate).not.toHaveBeenCalled();
});

test("POST /calculate saves the calculation and its steps", async () => {
  const response = await request(app)
    .post("/calculate")
    .send({ num1: 5, num2: 5, num3: 8, num4: 3, num5: 5 });

  expect(response.status).toBe(200);

  expect(mockCalculationCreate).toHaveBeenCalledWith({
    data: {
      result: 10,
      steps: {
        create: [
          {
            stepOrder: 1,
            operation: "add",
            inputs: [5, 5],
            result: 10,
          },
          {
            stepOrder: 2,
            operation: "subtract",
            inputs: [8, 3],
            result: 5,
          },
          {
            stepOrder: 3,
            operation: "multiply",
            inputs: [10, 5],
            result: 50,
          },
          {
            stepOrder: 4,
            operation: "divide",
            inputs: [50, 5],
            result: 10,
          },
        ],
      },
    },
  });
});