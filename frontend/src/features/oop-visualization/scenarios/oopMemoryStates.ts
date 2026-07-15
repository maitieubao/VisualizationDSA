export interface MemoryVariable {
  name: string;
  type: string;
  value: string;
  pointsToId?: number; // references a HeapObject ID
}

export interface HeapField {
  name: string;
  value: string;
  accessModifier: 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
  isViolated?: boolean;
}

export interface VTableEntry {
  method: string;
  resolvesTo: string;
}

export interface HeapObject {
  id: number;
  className: string;
  fields: HeapField[];
  vTable?: VTableEntry[];
}

export interface MemoryState {
  stack: MemoryVariable[];
  heap: HeapObject[];
  callStack: string[];
}

export const OOP_MEMORY_STATES: Record<string, MemoryState[]> = {
  encapsulation: [
    // Step 0: class BankAccount (Đang nạp định nghĩa lớp)
    { stack: [], heap: [], callStack: [] },
    // Step 1: private balance
    { stack: [], heap: [], callStack: [] },
    // Step 2: Constructor
    { stack: [], heap: [], callStack: [] },
    // Step 3: Deposit
    { stack: [], heap: [], callStack: [] },
    // Step 4: Withdraw
    { stack: [], heap: [], callStack: [] },
    // Step 5: BankAccount acc = new BankAccount(1000);
    {
      stack: [
        { name: 'acc', type: 'BankAccount', value: 'ref @BankAccount1', pointsToId: 1 }
      ],
      heap: [
        {
          id: 1,
          className: 'BankAccount',
          fields: [
            { name: 'balance', value: '1000.0', accessModifier: 'PRIVATE' }
          ]
        }
      ],
      callStack: ['main()', 'BankAccount.ctor(1000.0)']
    },
    // Step 6: acc.balance = 9999; (❌ Lỗi biên dịch!)
    {
      stack: [
        { name: 'acc', type: 'BankAccount', value: 'ref @BankAccount1', pointsToId: 1 }
      ],
      heap: [
        {
          id: 1,
          className: 'BankAccount',
          fields: [
            { name: 'balance', value: '1000.0', accessModifier: 'PRIVATE', isViolated: true }
          ]
        }
      ],
      callStack: ['main() (Lỗi: acc.balance = 9999)']
    },
    // Step 7: acc.Deposit(500);
    {
      stack: [
        { name: 'acc', type: 'BankAccount', value: 'ref @BankAccount1', pointsToId: 1 }
      ],
      heap: [
        {
          id: 1,
          className: 'BankAccount',
          fields: [
            { name: 'balance', value: '1500.0 (Thay đổi)', accessModifier: 'PRIVATE' }
          ]
        }
      ],
      callStack: ['main()', 'BankAccount.Deposit(500.0)']
    },
    // Step 8: acc.Withdraw(200);
    {
      stack: [
        { name: 'acc', type: 'BankAccount', value: 'ref @BankAccount1', pointsToId: 1 }
      ],
      heap: [
        {
          id: 1,
          className: 'BankAccount',
          fields: [
            { name: 'balance', value: '1300.0 (Thay đổi)', accessModifier: 'PRIVATE' }
          ]
        }
      ],
      callStack: ['main()', 'BankAccount.Withdraw(200.0)']
    },
    // Step 9: acc.Withdraw(9999); (❌ Từ chối)
    {
      stack: [
        { name: 'acc', type: 'BankAccount', value: 'ref @BankAccount1', pointsToId: 1 }
      ],
      heap: [
        {
          id: 1,
          className: 'BankAccount',
          fields: [
            { name: 'balance', value: '1300.0 (Giữ nguyên)', accessModifier: 'PRIVATE', isViolated: true }
          ]
        }
      ],
      callStack: ['main()', 'BankAccount.Withdraw(9999.0) (Bị từ chối)']
    }
  ],

  inheritance: [
    // Step 0: class Animal
    { stack: [], heap: [], callStack: [] },
    // Step 1: private int age
    { stack: [], heap: [], callStack: [] },
    // Step 2: protected string Name
    { stack: [], heap: [], callStack: [] },
    // Step 3: Dog : Animal
    { stack: [], heap: [], callStack: [] },
    // Step 4: Console.WriteLine(Name); (protected OK)
    { stack: [], heap: [], callStack: [] },
    // Step 5: Console.WriteLine(age); (private Error!)
    { stack: [], heap: [], callStack: [] },
    // Step 6: Luồng kế thừa chảy từ Animal -> Dog/Cat
    { stack: [], heap: [], callStack: [] },
    // Step 7: Dog dog = new Dog(); dog.Eat(); dog.Fetch();
    {
      stack: [
        { name: 'dog', type: 'Dog', value: 'ref @Dog1', pointsToId: 1 }
      ],
      heap: [
        {
          id: 1,
          className: 'Dog',
          fields: [
            { name: 'Name', value: '"Mực" (protected)', accessModifier: 'PROTECTED' },
            { name: 'age', value: '3 (private - Ẩn)', accessModifier: 'PRIVATE' }
          ]
        }
      ],
      callStack: ['main()', 'Dog.ctor()', 'Animal.ctor()']
    },
    // Step 8: Console.WriteLine(dog.Name); (❌ protected error)
    {
      stack: [
        { name: 'dog', type: 'Dog', value: 'ref @Dog1', pointsToId: 1 }
      ],
      heap: [
        {
          id: 1,
          className: 'Dog',
          fields: [
            { name: 'Name', value: '"Mực" (Truy cập ngoài lỗi)', accessModifier: 'PROTECTED', isViolated: true },
            { name: 'age', value: '3', accessModifier: 'PRIVATE' }
          ]
        }
      ],
      callStack: ['main() (Lỗi: dog.Name ngoài class)']
    }
  ],

  abstraction: [
    // Step 0: class Vehicle
    { stack: [], heap: [], callStack: [] },
    // Step 1: Brand (public)
    { stack: [], heap: [], callStack: [] },
    // Step 2: GetDescription()
    { stack: [], heap: [], callStack: [] },
    // Step 3: Start() / FuelType() (abstract)
    { stack: [], heap: [], callStack: [] },
    // Step 4: Vehicle v = new Vehicle(); (❌ Lỗi)
    { stack: [], heap: [], callStack: [], },
    // Step 5: Car : Vehicle
    { stack: [], heap: [], callStack: [] },
    // Step 6: Car car = new Car(); car.Start();
    {
      stack: [
        { name: 'car', type: 'Car', value: 'ref @Car1', pointsToId: 1 }
      ],
      heap: [
        {
          id: 1,
          className: 'Car',
          fields: [
            { name: 'Brand', value: '"Toyota"', accessModifier: 'PUBLIC' }
          ]
        }
      ],
      callStack: ['main()', 'Car.ctor()', 'Vehicle.ctor()']
    },
    // Step 7: car.GetDescription();
    {
      stack: [
        { name: 'car', type: 'Car', value: 'ref @Car1', pointsToId: 1 }
      ],
      heap: [
        {
          id: 1,
          className: 'Car',
          fields: [
            { name: 'Brand', value: '"Toyota"', accessModifier: 'PUBLIC' }
          ]
        }
      ],
      callStack: ['main()', 'Vehicle.GetDescription()', 'Car.FuelType()']
    }
  ],

  polymorphism: [
    // Step 0: virtual Animal.Speak
    { stack: [], heap: [], callStack: [] },
    // Step 1: override Dog.Speak
    { stack: [], heap: [], callStack: [] },
    // Step 2: override Cat.Speak
    { stack: [], heap: [], callStack: [] },
    // Step 3: Fish speaks (new)
    { stack: [], heap: [], callStack: [] },
    // Step 4: Animal pet = new Dog(); pet.Speak();
    {
      stack: [
        { name: 'pet', type: 'Animal', value: 'ref @Dog1', pointsToId: 1 }
      ],
      heap: [
        {
          id: 1,
          className: 'Dog',
          fields: [],
          vTable: [
            { method: 'Speak()', resolvesTo: 'Dog.Speak() ("Gâu gâu!")' }
          ]
        }
      ],
      callStack: ['main()', 'Animal.Speak() ➔ Dog.Speak()']
    },
    // Step 5: pet = new Cat(); pet.Speak();
    {
      stack: [
        { name: 'pet', type: 'Animal', value: 'ref @Cat1', pointsToId: 2 }
      ],
      heap: [
        {
          id: 2,
          className: 'Cat',
          fields: [],
          vTable: [
            { method: 'Speak()', resolvesTo: 'Cat.Speak() ("Meo meo!")' }
          ]
        }
      ],
      callStack: ['main()', 'Animal.Speak() ➔ Cat.Speak()']
    },
    // Step 6: Loop animals Speak()
    {
      stack: [
        { name: 'animals', type: 'Animal[]', value: 'ref @Array1', pointsToId: 3 }
      ],
      heap: [
        {
          id: 3,
          className: 'Animal[]',
          fields: [
            { name: '[0]', value: 'ref @Dog1', accessModifier: 'PUBLIC' },
            { name: '[1]', value: 'ref @Cat1', accessModifier: 'PUBLIC' },
            { name: '[2]', value: 'ref @Dog2', accessModifier: 'PUBLIC' }
          ]
        }
      ],
      callStack: ['main()', 'foreach (var pet in pets)']
    },
    // Step 7: Animal f = new Fish(); f.Speak(); (No polymorphism!)
    {
      stack: [
        { name: 'f', type: 'Animal', value: 'ref @Fish1', pointsToId: 4 }
      ],
      heap: [
        {
          id: 4,
          className: 'Fish',
          fields: [],
          vTable: [
            { method: 'Speak()', resolvesTo: 'Animal.Speak() ("...")' }
          ]
        }
      ],
      callStack: ['main()', 'Animal.Speak() ➔ Animal.Speak() (Không override)']
    }
  ],

  interface: [
    // Step 0: IPayment
    { stack: [], heap: [], callStack: [] },
    // Step 1: ILoggable
    { stack: [], heap: [], callStack: [] },
    // Step 2: CreditCard : IPayment, ILoggable
    { stack: [], heap: [], callStack: [] },
    // Step 3: CC calling Log()
    { stack: [], heap: [], callStack: [] },
    // Step 4: MoMo : IPayment
    { stack: [], heap: [], callStack: [] },
    // Step 5: OrderService
    { stack: [], heap: [], callStack: [] },
    // Step 6: order1 = new OrderService(new CreditCard())
    {
      stack: [
        { name: 'order1', type: 'OrderService', value: 'ref @OrderService1', pointsToId: 1 }
      ],
      heap: [
        {
          id: 1,
          className: 'OrderService',
          fields: [
            { name: '_payment', value: 'ref @CreditCard1 (CreditCard)', accessModifier: 'PRIVATE' }
          ]
        },
        {
          id: 2,
          className: 'CreditCard',
          fields: [],
          vTable: [
            { method: 'ProcessPayment', resolvesTo: 'CreditCard.ProcessPayment' },
            { method: 'Log', resolvesTo: 'CreditCard.Log' }
          ]
        }
      ],
      callStack: ['main()', 'OrderService.ctor(CreditCard)']
    },
    // Step 7: order2 = new OrderService(new MoMo())
    {
      stack: [
        { name: 'order1', type: 'OrderService', value: 'ref @OrderService1', pointsToId: 1 },
        { name: 'order2', type: 'OrderService', value: 'ref @OrderService2', pointsToId: 3 }
      ],
      heap: [
        {
          id: 1,
          className: 'OrderService',
          fields: [
            { name: '_payment', value: 'ref @CreditCard1 (CreditCard)', accessModifier: 'PRIVATE' }
          ]
        },
        {
          id: 2,
          className: 'CreditCard',
          fields: []
        },
        {
          id: 3,
          className: 'OrderService',
          fields: [
            { name: '_payment', value: 'ref @MoMo1 (MoMo)', accessModifier: 'PRIVATE' }
          ]
        },
        {
          id: 4,
          className: 'MoMo',
          fields: [],
          vTable: [
            { method: 'ProcessPayment', resolvesTo: 'MoMo.ProcessPayment' }
          ]
        }
      ],
      callStack: ['main()', 'OrderService.ctor(MoMo)']
    },
    // Step 8: So sánh abstract vs interface
    {
      stack: [
        { name: 'order1', type: 'OrderService', value: 'ref @OrderService1', pointsToId: 1 },
        { name: 'order2', type: 'OrderService', value: 'ref @OrderService2', pointsToId: 3 }
      ],
      heap: [
        {
          id: 1,
          className: 'OrderService',
          fields: [
            { name: '_payment', value: 'ref @CreditCard1 (CreditCard)', accessModifier: 'PRIVATE' }
          ]
        },
        {
          id: 3,
          className: 'OrderService',
          fields: [
            { name: '_payment', value: 'ref @MoMo1 (MoMo)', accessModifier: 'PRIVATE' }
          ]
        }
      ],
      callStack: ['main()']
    }
  ]
};
