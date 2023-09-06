const roles = [
  {
    _id: '5e0af1c63b6482125c1b22cb',
    name: 'Super Admin',
    description:
      'Super Admins can access and manage all features and settings.',
    type: 'SUPER_ADMIN',
  },
  {
    _id: '5e0af1c63b6482125c1b44cb',
    name: 'Authenticated',
    description: 'Default role given to authenticated user.',
    type: 'AUTHENTICATED',
  },
  {
    _id: '5e0af1c63b6482125c1b44cc',
    name: 'Customer',
    description: 'Default role given to customer user.',
    type: 'CUSTOMER',
  },
  {
    _id: '5e0af1c63b6482125c1b44cd',
    name: 'Admin',
    description: 'Default role given to admin user.',
    type: 'ADMIN',
  },
  {
    _id: '5e0af1c63b6482125c1b44ce',
    name: 'Agent',
    description: 'Default role given to agent user.',
    type: 'AGENT',
  },
]

const users = {
  _id: '5063114bd386d8fadbd6b00a',
  name: 'Ahmed Ibrahim',
  email: 'info@soomar.so',
  password: '123456',
  mobile: 615301507,
  confirmed: true,
  blocked: false,
}

const profile = {
  _id: '5063114bd386d8fadbd6b00b',
  mobile: 252615301507,
  address: 'Mogadishu',
  image: 'https://github.com/ahmedibradotcom.png',
  bio: 'Full Stack Developer',
}

const sort = {
  hidden: 0,
  normal: 1,
  profile: 2,
  admin: 3,
  internet: 4,
  report: 5,
}

const clientPermissions = [
  {
    _id: '637e0261fadbdf65bba856b6',
    name: 'Home',
    path: '/',
    menu: 'hidden',
    sort: sort.hidden,
    description: 'Home page',
  },
  {
    _id: '637e0261fadbdf65bba856b7',
    name: 'Users',
    path: '/admin/users',
    menu: 'admin',
    sort: sort.admin,
    description: 'Users page',
  },
  {
    _id: '637e0261fadbdf65bba856b8',
    name: 'Roles',
    path: '/admin/roles',
    menu: 'admin',
    sort: sort.admin,
    description: 'Roles page',
  },
  {
    _id: '637e0261fadbdf65bba856b9',
    name: 'Profile',
    path: '/account/profile',
    menu: 'profile',
    sort: sort.profile,
    description: 'Profile page',
  },
  {
    _id: '637e0261fadbdf65bba856bb',
    name: 'Permissions',
    path: '/admin/permissions',
    menu: 'admin',
    sort: sort.admin,
    description: 'Permissions page',
  },
  {
    _id: '637e0261fadbdf65bba856ba',
    name: 'Client Permissions',
    path: '/admin/client-permissions',
    menu: 'admin',
    sort: sort.admin,
    description: 'Client Permissions page',
  },
  {
    _id: '637e0261fadbdf65bba856bc',
    name: 'User Roles',
    path: '/admin/user-roles',
    menu: 'admin',
    sort: sort.admin,
    description: 'User Roles page',
  },
  {
    _id: '637e0261fadbdf65bba856bd',
    name: 'User Profiles',
    path: '/admin/user-profiles',
    menu: 'admin',
    sort: sort.admin,
    description: 'User Profiles page',
  },
  {
    _id: '646e3462b086bb61e1081477',
    name: 'Internet Providers',
    path: '/internets/providers',
    menu: 'internet',
    sort: sort.internet,
    description: 'Internet Providers page',
  },
  {
    _id: '646e3462b086bb61e1081478',
    name: 'Internet Categories',
    path: '/internets/categories',
    menu: 'internet',
    sort: sort.internet,
    description: 'Internet Categories page',
  },
  {
    _id: '646e3462b086bb61e1081479',
    name: 'Internet Bundles',
    path: '/internets/bundles',
    menu: 'internet',
    sort: sort.internet,
    description: 'Internet Bundles page',
  },
  {
    _id: '646e3462b086bb61e1081449',
    name: 'Business',
    path: '/businesses',
    menu: 'normal',
    sort: sort.normal,
    description: 'Business page',
  },

  {
    _id: '64aae2bae066a4c23c0bf9e1',
    name: 'Business Internet',
    path: '/reports/internets/businesses',
    menu: 'report',
    sort: sort.report,
    description: 'Business internet report page',
  },
  {
    _id: '64aae2bae066a4c23c0bf9e2',
    name: 'Customer Internet',
    path: '/reports/internets/customers',
    menu: 'report',
    sort: sort.report,
    description: 'Customer internet report page',
  },
  {
    _id: '64aae2bae066a4c23c0bf9e3',
    name: 'Order',
    path: '/reports/orders',
    menu: 'report',
    sort: sort.report,
    description: 'Order report page',
  },
  {
    _id: '64aae2bae066a4c23c0bf5e5',
    name: 'Payment',
    path: '/reports/payments',
    menu: 'report',
    sort: sort.report,
    description: 'Payment report page',
  },
]

const permissions = [
  // Users
  {
    _id: '637e01fbfadbdf65bba855e2',
    description: 'Users',
    route: '/api/auth/users',
    name: 'Users',
    method: 'GET',
  },
  {
    _id: '637e01fbfadbdf65bba855e3',
    description: 'User By Id',
    route: '/api/auth/users/:id',
    name: 'Users',
    method: 'GET',
  },
  {
    _id: '637e01fbfadbdf65bba855e4',
    description: 'User',
    route: '/api/auth/users',
    name: 'Users',
    method: 'POST',
  },
  {
    _id: '637e01fbfadbdf65bba855e6',
    description: 'User',
    route: '/api/auth/users/:id',
    name: 'Users',
    method: 'PUT',
  },
  {
    _id: '637e01fbfadbdf65bba855e7',
    description: 'User',
    route: '/api/auth/users/:id',
    name: 'Users',
    method: 'DELETE',
  },

  //   User Profile
  {
    _id: '637e01fbfadbdf65bba855e5',
    description: 'Profiles',
    route: '/api/auth/user-profiles',
    name: 'User Profiles',
    method: 'GET',
  },
  {
    _id: '637e01fbfadbdf65bba855e8',
    description: 'Profile',
    route: '/api/auth/profile',
    name: 'User Profile',
    method: 'GET',
  },
  {
    _id: '637e01fbfadbdf65bba855e9',
    description: 'Profile',
    route: '/api/auth/profile/:id',
    name: 'User Profile',
    method: 'PUT',
  },

  //   Role
  {
    _id: '637e01fbfadbdf65bba855ea',
    description: 'Roles',
    route: '/api/auth/roles',
    name: 'Roles',
    method: 'GET',
  },
  {
    _id: '637e01fbfadbdf65bba855eb',
    description: 'Role',
    route: '/api/auth/roles',
    name: 'Roles',
    method: 'POST',
  },
  {
    _id: '637e01fbfadbdf65bba855ec',
    description: 'Role',
    route: '/api/auth/roles/:id',
    name: 'Roles',
    method: 'PUT',
  },
  {
    _id: '637e01fbfadbdf65bba855ed',
    description: 'Role',
    route: '/api/auth/roles/:id',
    name: 'Roles',
    method: 'DELETE',
  },

  //   Permission
  {
    _id: '637e01fbfadbdf65bba855ee',
    description: 'Permissions',
    route: '/api/auth/permissions',
    name: 'Permissions',
    method: 'GET',
  },
  {
    _id: '637e01fbfadbdf65bba855ef',
    description: 'Permission',
    route: '/api/auth/permissions',
    name: 'Permissions',
    method: 'POST',
  },
  {
    _id: '637e01fbfadbdf65bba855f0',
    description: 'Permission',
    route: '/api/auth/permissions/:id',
    name: 'Permissions',
    method: 'PUT',
  },
  {
    _id: '637e01fbfadbdf65bba855f1',
    description: 'Permission',
    route: '/api/auth/permissions/:id',
    name: 'Permissions',
    method: 'DELETE',
  },

  //   User Role
  {
    _id: '637e01fbfadbdf65bba855f2',
    description: 'User Roles',
    route: '/api/auth/user-roles',
    name: 'User Roles',
    method: 'GET',
  },
  {
    _id: '637e01fbfadbdf65bba855f4',
    description: 'User Role',
    route: '/api/auth/user-roles',
    name: 'User Roles',
    method: 'POST',
  },
  {
    _id: '637e01fbfadbdf65bba855f3',
    description: 'User Role',
    route: '/api/auth/user-roles/:id',
    name: 'User Roles',
    method: 'PUT',
  },
  {
    _id: '637e01fbfadbdf65bba855f5',
    description: 'User Role',
    route: '/api/auth/user-roles/:id',
    name: 'User Roles',
    method: 'DELETE',
  },

  //   Client Permission
  {
    _id: '637e01fbfadbdf65bba855f6',
    description: 'Client Permissions',
    route: '/api/auth/client-permissions',
    name: 'ClientPermissions',
    method: 'GET',
  },
  {
    _id: '637e01fbfadbdf65bba855f7',
    description: 'Client Permission',
    route: '/api/auth/client-permissions',
    name: 'ClientPermissions',
    method: 'POST',
  },
  {
    _id: '637e01fbfadbdf65bba855f8',
    description: 'Client Permission',
    route: '/api/auth/client-permissions/:id',
    name: 'ClientPermissions',
    method: 'PUT',
  },
  {
    _id: '637e01fbfadbdf65bba855f9',
    description: 'Client Permission',
    route: '/api/auth/client-permissions/:id',
    name: 'ClientPermissions',
    method: 'DELETE',
  },

  //   Internet Provider
  {
    _id: '646e334db086bb61e1081466',
    description: 'Internet Providers',
    route: '/api/internets/providers',
    name: 'Internet Providers',
    method: 'GET',
  },
  {
    _id: '646e334db086bb61e1081467',
    description: 'Internet Provider',
    route: '/api/internets/providers',
    name: 'Internet Providers',
    method: 'POST',
  },
  {
    _id: '646e334db086bb61e1081468',
    description: 'Internet Provider',
    route: '/api/internets/providers/:id',
    name: 'Internet Providers',
    method: 'PUT',
  },
  {
    _id: '646e334db086bb61e1081469',
    description: 'Internet Provider',
    route: '/api/internets/providers/:id',
    name: 'Internet Providers',
    method: 'DELETE',
  },

  //   Internet Category
  {
    _id: '646e3462b086bb61e1081477',
    description: 'Internet Categories',
    route: '/api/internets/categories',
    name: 'Internet Categories',
    method: 'GET',
  },
  {
    _id: '646e3462b086bb61e1081478',
    description: 'Internet Category',
    route: '/api/internets/categories',
    name: 'Internet Categories',
    method: 'POST',
  },
  {
    _id: '646e3462b086bb61e1081479',
    description: 'Internet Category',
    route: '/api/internets/categories/:id',
    name: 'Internet Categories',
    method: 'PUT',
  },
  {
    _id: '646e3462b086bb61e108147a',
    description: 'Internet Category',
    route: '/api/internets/categories/:id',
    name: 'Internet Categories',
    method: 'DELETE',
  },

  //   Bundle
  {
    _id: '646e344eb086bb61e1081473',
    description: 'Bundles',
    route: '/api/internets/bundles',
    name: 'Internet Bundles',
    method: 'GET',
  },
  {
    _id: '646e344eb086bb61e1081474',
    description: 'Bundle',
    route: '/api/internets/bundles',
    name: 'Internet Bundles',
    method: 'POST',
  },
  {
    _id: '646e344eb086bb61e1081475',
    description: 'Bundle',
    route: '/api/internets/bundles/:id',
    name: 'Internet Bundles',
    method: 'PUT',
  },
  {
    _id: '646e344eb086bb61e1081476',
    description: 'Bundle',
    route: '/api/internets/bundles/:id',
    name: 'Internet Bundles',
    method: 'DELETE',
  },

  //   Business
  {
    _id: '64aae332e066a4c23c0bf9e7',
    description: 'Businesses',
    route: '/api/businesses',
    name: 'Businesses',
    method: 'GET',
  },
  {
    _id: '64aae2bae066a4c23c0bf9e7',
    description: 'Business',
    route: '/api/businesses',
    name: 'Businesses',
    method: 'POST',
  },
  {
    _id: '64aae2bae066a4c23c0bf9e8',
    description: 'Business',
    route: '/api/businesses/:id',
    name: 'Businesses',
    method: 'PUT',
  },
  {
    _id: '64aae2bae066a4c23c0bf9e9',
    description: 'Business',
    route: '/api/businesses/:id',
    name: 'Businesses',
    method: 'DELETE',
  },

  //   Report
  {
    _id: '64aae2bae066a4c23c0bf9e4',
    description: 'Internet Report',
    route: '/api/reports/internets/customers',
    name: 'Report',
    method: 'GET',
  },
  {
    _id: '64aae2bae066a4c23c0bf9e5',
    description: 'Business Internet Report',
    route: '/api/reports/internets/businesses',
    name: 'Report',
    method: 'GET',
  },
  {
    _id: '64aae2bae066a4c23c0bf9e6',
    description: 'Orders Report',
    route: '/api/reports/orders',
    name: 'Report',
    method: 'GET',
  },
  {
    _id: '64aae2bae066a4c23c0bf966',
    description: 'Payments Report',
    route: '/api/reports/payments',
    name: 'Report',
    method: 'GET',
  },

  //   Notification
  {
    _id: '64e453eec9eb251f670996a5',
    description: 'WEB: Get notifications',
    route: '/api/notifications',
    name: 'Notifications',
    method: 'GET',
  },
  {
    _id: '64e453eec9eb251f670996a6',
    description: 'WEB: Create notification',
    route: '/api/notifications',
    name: 'Notifications',
    method: 'POST',
  },
  {
    _id: '64e453eec9eb251f670996a7',
    description: 'WEB: Update notification/:id',
    route: '/api/notifications',
    name: 'Notifications',
    method: 'PUT',
  },
  {
    _id: '64e45406c9eb251f670996a8',
    description: 'WEB: Delete notification/:id',
    route: '/api/notifications',
    name: 'Notifications',
    method: 'DELETE',
  },

  {
    _id: '64e453eec9eb251f670996a8',
    description: 'WEB: Send notification',
    route: '/api/notifications/send',
    name: 'Notifications',
    method: 'POST',
  },

  // ================== MOBILE ======================

  //   Chat
  {
    _id: '643bdfca6e2f031ae50db335',
    description: 'Get list of chats / chat history',
    route: '/api/mobile/chats/:id/:id',
    name: 'Mobile Chats',
    method: 'GET',
  },
  {
    _id: '643bdfca6e2f031ae50db336',
    description: 'Get current chat',
    route: '/api/mobile/chats',
    name: 'Mobile Chats',
    method: 'GET',
  },
  {
    _id: '643bdfca6e2f031ae50db337',
    description: 'Create or update current chat',
    route: '/api/mobile/chats',
    name: 'Mobile Chats',
    method: 'POST',
  },

  // Profile
  {
    _id: '643bdfca6e2f031ae50db338',
    description: 'Get profile',
    route: '/api/mobile/profile',
    name: 'Mobile Profile',
    method: 'GET',
  },
  {
    _id: '643bdfca6e2f031ae50db339',
    description: 'Update profile',
    route: '/api/mobile/profile',
    name: 'Mobile Profile',
    method: 'POST',
  },
  {
    _id: '647728a82849d153ae03f37b',
    description: 'Upgrade account to agent',
    route: '/api/mobile/profile/:id',
    name: 'Mobile Profile',
    method: 'PUT',
  },

  // Category
  {
    _id: '643bdfca6e2f031ae50db333',
    description: 'Get categories',
    route: '/api/mobile/categories',
    name: 'Mobile Category',
    method: 'GET',
  },

  // Sub-Category
  {
    _id: '643bdfca6e2f031ae50db31a',
    description: 'Get sub-categories',
    route: '/api/mobile/sub-categories',
    name: 'Mobile Sub-Category',
    method: 'GET',
  },

  // Inventory
  {
    _id: '643bdfca6e2f031ae50db34a',
    description: 'Get inventories',
    route: '/api/mobile/inventories',
    name: 'Mobile Inventory',
    method: 'GET',
  },
  {
    _id: '643bdfca6e2f031ae50db35a',
    description: 'Get product inventory details',
    route: '/api/mobile/inventories/:id',
    name: 'Mobile Inventory',
    method: 'GET',
  },
  {
    _id: '645f38e0ca681a19c40dad9c',
    name: 'Mobile Mobile Inventory',
    route: '/api/mobile/inventories/search',
    method: 'GET',
    description: 'Search inventory',
  },

  // Order
  {
    _id: '643bdfca6e2f031ae50db36a',
    description: 'Create order',
    route: '/api/mobile/orders',
    name: 'Mobile Order',
    method: 'POST',
  },
  {
    _id: '643bdfca6e2f031ae50db363',
    description: 'Get all order transactions by user',
    route: '/api/mobile/orders/transactions',
    name: 'Mobile Order',
    method: 'GET',
  },

  // Payment
  {
    _id: '643bdfca6e2f031ae50db36b',
    description: 'Exchange points',
    route: '/api/mobile/payments/exchange',
    name: 'Mobile Payment',
    method: 'POST',
  },

  // Internet
  {
    _id: '64719ac71155b3dbaa0d38d2',
    description: 'Internet providers',
    route: '/api/mobile/internets/providers',
    name: 'Mobile Internet',
    method: 'GET',
  },
  {
    _id: '64719ac71155b3dbaa0d38d3',
    description: 'Internet categories',
    route: '/api/mobile/internets/categories',
    name: 'Mobile Internet',
    method: 'GET',
  },
  {
    _id: '64719ac71155b3dbaa0d38d4',
    description: 'Internet bundles',
    route: '/api/mobile/internets/bundles',
    name: 'Mobile Internet',
    method: 'GET',
  },
  {
    _id: '64719ac71155b3dbaa0d38d5',
    description: 'Internet recharge',
    route: '/api/mobile/internets/recharge',
    name: 'Mobile Internet',
    method: 'POST',
  },
  {
    _id: '64719ac71155b3dbaa0d38d6',
    description: 'Get all internet transactions by user',
    route: '/api/mobile/internets/transactions',
    name: 'Mobile Internet',
    method: 'GET',
  },

  //   Notification
  {
    _id: '64e453eec9eb251f670996a4',
    description: 'Get notifications',
    route: '/api/mobile/notifications',
    name: 'Notifications',
    method: 'GET',
  },
]

export { roles, users, profile, permissions, clientPermissions }
