const { getMe, updateProfile } = require('../user.controller');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getMe', () => {
    test('should return user profile without password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        provider: 'local',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashedpassword',
          provider: 'local',
        }),
      };
      req.user = mockUser;

      await getMe(req, res);

      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        provider: 'local',
      });
    });

    test('should handle errors', async () => {
      req.user = {
        toJSON: jest.fn().mockImplementation(() => {
          throw new Error('Serialization error');
        }),
      };

      await getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Serialization error' });
    });
  });

  describe('updateProfile', () => {
    test('should update user profile successfully', async () => {
      req.body = { name: 'Updated Name' };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'test@example.com',
          name: 'Updated Name',
        }),
      };
      req.user = mockUser;

      await updateProfile(req, res);

      expect(mockUser.name).toBe('Updated Name');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        user: { id: 1, email: 'test@example.com', name: 'Updated Name' },
      });
    });

    test('should return 400 if name is missing', async () => {
      req.body = { name: '' };
      req.user = { id: 1 };

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Name is required' });
    });

    test('should return 400 if name is only whitespace', async () => {
      req.body = { name: '   ' };
      req.user = { id: 1 };

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Name is required' });
    });

    test('should handle errors', async () => {
      req.body = { name: 'Updated Name' };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        save: jest.fn().mockRejectedValue(new Error('Save error')),
      };
      req.user = mockUser;

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Save error' });
    });
  });
});
