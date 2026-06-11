import User from '../models/User.js';

function publicUser(user) {
  return {
    _id: user._id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt
  };
}

export async function createUser(req, res, next) {
  try {
    const username = req.body.username.toLowerCase();
    const { password, role = 'user' } = req.body;

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.error('Username already exists', 409);
    }

    const user = await User.create({ username, password, role });

    return res.success('User created successfully', { user: publicUser(user) }, 201);
  } catch (error) {
    return next(error);
  }
}

export async function getUsers(_req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.success('Users retrieved successfully', { users: users.map(publicUser) });
  } catch (error) {
    return next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.error('User not found', 404);
    }

    return res.success('User retrieved successfully', { user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.error('User not found', 404);
    }

    const mainAdminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    const nextUsername = req.body.username?.toLowerCase();

    if (nextUsername && nextUsername !== user.username) {
      const existingUser = await User.findOne({ username: nextUsername });

      if (existingUser) {
        return res.error('Username already exists', 409);
      }

      user.username = nextUsername;
    }

    if (req.body.role) {
      if (user.username === mainAdminUsername && req.body.role !== 'admin') {
        return res.error('The main admin account must remain an admin', 403);
      }

      user.role = req.body.role;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    return res.success('User updated successfully', { user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.error('User not found', 404);
    }

    const mainAdminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();

    if (user.username === mainAdminUsername) {
      return res.error('The main admin account cannot be deleted', 403);
    }

    await user.deleteOne();

    return res.success('User deleted successfully');
  } catch (error) {
    return next(error);
  }
}
