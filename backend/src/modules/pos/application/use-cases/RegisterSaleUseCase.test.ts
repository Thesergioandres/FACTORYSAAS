import { RegisterSaleUseCase } from './RegisterSaleUseCase';
import mongoose from 'mongoose';

describe('RegisterSaleUseCase', () => {
  let useCase: RegisterSaleUseCase;
  let mockPosRepository: any;
  let mockInventoryRepository: any;

  const mockStartTransaction = jest.fn();
  const mockCommitTransaction = jest.fn();
  const mockAbortTransaction = jest.fn();
  const mockEndSession = jest.fn();

  const mockSession = {
    startTransaction: mockStartTransaction,
    commitTransaction: mockCommitTransaction,
    abortTransaction: mockAbortTransaction,
    endSession: mockEndSession
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPosRepository = {
      createSale: jest.fn().mockResolvedValue({ id: 'sale-1', total: 100 })
    };

    mockInventoryRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'prod-1',
        name: 'Shampoo',
        active: true,
        warehouseStock: 50,
        averageCost: 5
      }),
      decrementStock: jest.fn().mockResolvedValue({ id: 'prod-1', stock: 49 })
    };

    useCase = new RegisterSaleUseCase({
      posRepository: mockPosRepository,
      inventoryRepository: mockInventoryRepository
    });

    jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession as any);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('debe revertir si no hay items', async () => {
    const result = await useCase.execute({
      tenantId: 'tenant-1',
      role: 'ADMIN',
      items: []
    });
    const res = result as any;
    expect(res.error).toBe('Items requeridos');
    expect(res.statusCode).toBe(400);
  });

  it('debe orquestar la transacción, deducir SellerStock e inyectar paymentStatus PENDING si es CREDIT', async () => {
    const result = await useCase.execute({
      tenantId: 'tenant-1',
      sellerId: 'emp-123',
      role: 'SELLER',
      paymentMethod: 'CREDIT',
      items: [{ productId: 'prod-1', name: 'Shampoo', quantity: 2, price: 10 }]
    });

    expect(mongoose.startSession).toHaveBeenCalled();
    
    expect(mockInventoryRepository.findById).toHaveBeenCalledWith('prod-1', 'tenant-1');
    expect(mockInventoryRepository.decrementStock).toHaveBeenCalledWith(
      'tenant-1',
      'prod-1',
      2,
      'emp-123',
      { session: mockSession }
    );

    expect(mockPosRepository.createSale).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethod: 'CREDIT',
        paymentStatus: 'pendiente'
      }),
      { session: mockSession }
    );

    expect(mockCommitTransaction).toHaveBeenCalled();
    expect((result as any).sale).toBeDefined();
    expect((result as any).error).toBeUndefined();
  });

  it('debe deducir stock de bodega (undefined seller) si el rol es ADMIN', async () => {
    await useCase.execute({
      tenantId: 'tenant-1',
      role: 'ADMIN',
      sellerId: 'emp-123',
      paymentMethod: 'CASH',
      items: [{ productId: 'prod-1', name: 'Shampoo', quantity: 1, price: 10 }]
    });

    expect(mockInventoryRepository.decrementStock).toHaveBeenCalledWith(
      'tenant-1',
      'prod-1',
      1,
      undefined,
      { session: mockSession }
    );

    expect(mockPosRepository.createSale).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethod: 'CASH',
        paymentStatus: 'confirmado'
      }),
      { session: mockSession }
    );
  });
});
