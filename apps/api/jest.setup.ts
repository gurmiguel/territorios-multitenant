jest.mock('./src/tenants/tenant-holder.service')

const generatePrismaModuleMock = () => ({
  findFirst: jest.fn(),
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  upsert: jest.fn(),
})

jest.mock('./src/generated/prisma', () => ({
  PrismaClient: class {
    congregation = generatePrismaModuleMock()
    territory = generatePrismaModuleMock()
    street = generatePrismaModuleMock()
    house = generatePrismaModuleMock()
    statusUpdate = generatePrismaModuleMock()
    accountProvider = generatePrismaModuleMock()
    user = generatePrismaModuleMock()
  },
}))
