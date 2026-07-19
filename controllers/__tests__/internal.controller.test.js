const internalController = require("../internal.controller");

jest.mock("../../models", () => ({
  User: {
    findByPk: jest.fn(),
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
});
