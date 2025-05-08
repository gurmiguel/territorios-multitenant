jest.mock('./src/tenants/tenant-holder.service')

const generatePrismaModuleMock = () => ({
  find: jest.fn(),
  findMany: jest.fn(),
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
