const internalController = require("../internal.controller");

jest.mock("../../models", () => ({
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const { User } = require("../../models");

describe("internal.controller (user-service)", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {} };
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should return 404 if user not found", async () => {
    req.params.id = "missing";
    User.findByPk.mockResolvedValue(null);

    await internalController.getUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  it("should return the user without password", async () => {
    req.params.id = "user-1";
    const fakeUser = { id: "user-1", name: "Test", email: "test@example.com" };
    User.findByPk.mockResolvedValue(fakeUser);

    await internalController.getUserById(req, res, next);

    expect(User.findByPk).toHaveBeenCalledWith("user-1", { attributes: ["id", "name", "email"] });
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it("should call next on error", async () => {
    req.params.id = "user-1";
    const error = new Error("DB error");
    User.findByPk.mockRejectedValue(error);

    await internalController.getUserById(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("should return 404 if user not found by email", async () => {
    req.params.email = "missing@example.com";
    User.findOne.mockResolvedValue(null);
    await internalController.getUserByEmail(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  it("should return the user found by email", async () => {
    req.params.email = "test%40example.com";
    const fakeUser = { id: "user-1", name: "Test", email: "test@example.com" };
    User.findOne.mockResolvedValue(fakeUser);
    await internalController.getUserByEmail(req, res, next);
    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      attributes: ["id", "name", "email"],
    });
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it("should call next on error in getUserByEmail", async () => {
    req.params.email = "test@example.com";
    const error = new Error("DB error");
    User.findOne.mockRejectedValue(error);
    await internalController.getUserByEmail(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it("should return 400 if email or name missing on createUser", async () => {
    req.body = { email: "test@example.com" };
    await internalController.createUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "email and name are required" });
  });

  it("should return 409 if email already exists", async () => {
    req.body = { email: "test@example.com", name: "Test" };
    User.findOne.mockResolvedValue({ id: "existing-user" });
    await internalController.createUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Email already exists" });
  });

  it("should create and return the new user", async () => {
    req.body = { email: "new@example.com", name: "New User" };
    User.findOne.mockResolvedValue(null);
    const createdUser = { id: "new-id", email: "new@example.com", name: "New User" };
    User.create.mockResolvedValue(createdUser);
    await internalController.createUser(req, res, next);
    expect(User.create).toHaveBeenCalledWith({ email: "new@example.com", name: "New User" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "new-id", email: "new@example.com", name: "New User" });
  });

  it("should call next on error in createUser", async () => {
    req.body = { email: "test@example.com", name: "Test" };
    const error = new Error("DB error");
    User.findOne.mockRejectedValue(error);
    await internalController.createUser(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
