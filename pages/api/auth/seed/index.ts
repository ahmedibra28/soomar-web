'use strict'
import nc from 'next-connect'
import User from '../../../../models/User'
import Profile from '../../../../models/Profile'
import Role from '../../../../models/Role'
import Permission from '../../../../models/Permission'
import UserRole from '../../../../models/UserRole'
import ClientPermission from '../../../../models/ClientPermission'

import db from '../../../../config/db'

import {
  users,
  profile,
  roles,
  permissions,
  clientPermissions,
} from '../../../../config/data'
import { encryptPassword } from '../../../../utils/encryptPassword'

const handler = nc()

handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { secret } = req.query

      if (!secret || secret !== 'ts')
        return res.status(401).json({ error: 'Unauthorized' })

      // Check duplicate permissions
      permissions.map((p) => {
        if (p.method && p.route) {
          const duplicate = permissions.filter(
            (p2) => p2.method === p.method && p2.route === p.route
          )
          if (duplicate.length > 1) {
            return res.status(500).json({
              error: `Duplicate permission: ${p.method} ${p.route}`,
            })
          }
        }
      })

      // await User.updateMany(
      //   { email: { $regex: '@soomar.app', $options: 'i' } },
      //   { platform: 'soomar' }
      // )

      // find user update or create
      const userObject = await User.findOneAndUpdate(
        { _id: users._id },
        {
          _id: users._id,
          name: users.name,
          email: users.email,
          mobile: users.mobile,
          password: await encryptPassword(users.password),
          confirmed: true,
          blocked: false,
          platform: users.platform,
        },
        { new: true, upsert: true }
      )

      // Create profiles for users
      await Profile.findOneAndUpdate(
        { _id: profile._id },
        {
          _id: profile._id,
          user: userObject._id,
          name: userObject.name,
          address: profile.address,
          mobile: profile.mobile,
          bio: profile.bio,
          image: `https://ui-avatars.com/api/?uppercase=true&name=${userObject.name}&background=random&color=random&size=128`,
        },
        { new: true, upsert: true }
      )

      // Create permissions
      const permissionsObjects = await Promise.all(
        permissions?.map(
          async (obj) =>
            await Permission.findOneAndUpdate({ _id: obj._id }, obj, {
              new: true,
              upsert: true,
            })
        )
      )

      // Create client permissions
      const clientPermissionsObjects = await Promise.all(
        clientPermissions?.map(
          async (obj) =>
            await ClientPermission.findOneAndUpdate({ _id: obj._id }, obj, {
              new: true,
              upsert: true,
            })
        )
      )

      // Create roles
      const roleObj = Promise.all(
        roles?.map(
          async (obj) =>
            await Role.findOneAndUpdate({ _id: obj._id }, obj, {
              new: true,
              upsert: true,
            })
        )
      )
      const roleObjects = await roleObj

      // Create user roles
      await UserRole.findOneAndUpdate(
        { user: users._id },
        {
          user: users._id,
          role: roles[0]._id,
        },
        {
          new: true,
          upsert: true,
        }
      )

      // Find super admin role
      const superAdminRole = roleObjects.find((r) => r.type === 'SUPER_ADMIN')

      // Create permissions for super admin role
      superAdminRole.permission = permissionsObjects.map((p) => p._id)

      // create client permissions for super admin role
      superAdminRole.clientPermission = clientPermissionsObjects.map(
        (p) => p._id
      )

      // Update super admin role
      await superAdminRole.save()

      res.status(200).json({
        message: 'Database seeded successfully',
        users: await User.countDocuments({}),
        profiles: await Profile.countDocuments({}),
        permissions: await Permission.countDocuments({}),
        clientPermissions: await ClientPermission.countDocuments({}),
        roles: await Role.countDocuments({}),
        userRoles: await UserRole.countDocuments({}),
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
