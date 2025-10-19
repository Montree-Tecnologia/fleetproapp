import type {
  User, InsertUser,
  Vehicle, InsertVehicle,
  Driver, InsertDriver,
  Refueling, InsertRefueling,
  Refrigeration, InsertRefrigeration,
  Supplier, InsertSupplier,
  Company, InsertCompany
} from "@shared/schema";

export interface IStorage {
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  getVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;

  getDrivers(): Promise<Driver[]>;
  getDriverById(id: number): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: number, driver: Partial<InsertDriver>): Promise<Driver | undefined>;
  deleteDriver(id: number): Promise<boolean>;

  getRefuelings(): Promise<Refueling[]>;
  getRefuelingById(id: number): Promise<Refueling | undefined>;
  createRefueling(refueling: InsertRefueling): Promise<Refueling>;
  updateRefueling(id: number, refueling: Partial<InsertRefueling>): Promise<Refueling | undefined>;
  deleteRefueling(id: number): Promise<boolean>;

  getRefrigerations(): Promise<Refrigeration[]>;
  getRefrigerationById(id: number): Promise<Refrigeration | undefined>;
  createRefrigeration(refrigeration: InsertRefrigeration): Promise<Refrigeration>;
  updateRefrigeration(id: number, refrigeration: Partial<InsertRefrigeration>): Promise<Refrigeration | undefined>;
  deleteRefrigeration(id: number): Promise<boolean>;

  getSuppliers(): Promise<Supplier[]>;
  getSupplierById(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;

  getCompanies(): Promise<Company[]>;
  getCompanyById(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: User[] = [
    {
      id: 1,
      username: "admin",
      password: "admin123",
      name: "Administrator",
      role: "admin",
      permissions: ["manage_users", "manage_companies", "manage_vehicles", "manage_drivers", "manage_refuelings", "manage_refrigeration", "manage_suppliers"],
      active: true,
    },
  ];
  private vehicles: Vehicle[] = [];
  private drivers: Driver[] = [];
  private refuelings: Refueling[] = [];
  private refrigerations: Refrigeration[] = [];
  private suppliers: Supplier[] = [];
  private companies: Company[] = [];
  
  private userIdCounter = 2;
  private vehicleIdCounter = 1;
  private driverIdCounter = 1;
  private refuelingIdCounter = 1;
  private refrigerationIdCounter = 1;
  private supplierIdCounter = 1;
  private companyIdCounter = 1;

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = { ...user, id: this.userIdCounter++ };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...user };
    return this.users[index];
  }

  async deleteUser(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  async getVehicles(): Promise<Vehicle[]> {
    return this.vehicles;
  }

  async getVehicleById(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.find(v => v.id === id);
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const newVehicle: Vehicle = { ...vehicle, id: this.vehicleIdCounter++ };
    this.vehicles.push(newVehicle);
    return newVehicle;
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index === -1) return undefined;
    this.vehicles[index] = { ...this.vehicles[index], ...vehicle };
    return this.vehicles[index];
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index === -1) return false;
    this.vehicles.splice(index, 1);
    return true;
  }

  async getDrivers(): Promise<Driver[]> {
    return this.drivers;
  }

  async getDriverById(id: number): Promise<Driver | undefined> {
    return this.drivers.find(d => d.id === id);
  }

  async createDriver(driver: InsertDriver): Promise<Driver> {
    const newDriver: Driver = { ...driver, id: this.driverIdCounter++ };
    this.drivers.push(newDriver);
    return newDriver;
  }

  async updateDriver(id: number, driver: Partial<InsertDriver>): Promise<Driver | undefined> {
    const index = this.drivers.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    this.drivers[index] = { ...this.drivers[index], ...driver };
    return this.drivers[index];
  }

  async deleteDriver(id: number): Promise<boolean> {
    const index = this.drivers.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.drivers.splice(index, 1);
    return true;
  }

  async getRefuelings(): Promise<Refueling[]> {
    return this.refuelings;
  }

  async getRefuelingById(id: number): Promise<Refueling | undefined> {
    return this.refuelings.find(r => r.id === id);
  }

  async createRefueling(refueling: InsertRefueling): Promise<Refueling> {
    const newRefueling: Refueling = { ...refueling, id: this.refuelingIdCounter++ };
    this.refuelings.push(newRefueling);
    return newRefueling;
  }

  async updateRefueling(id: number, refueling: Partial<InsertRefueling>): Promise<Refueling | undefined> {
    const index = this.refuelings.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.refuelings[index] = { ...this.refuelings[index], ...refueling };
    return this.refuelings[index];
  }

  async deleteRefueling(id: number): Promise<boolean> {
    const index = this.refuelings.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.refuelings.splice(index, 1);
    return true;
  }

  async getRefrigerations(): Promise<Refrigeration[]> {
    return this.refrigerations;
  }

  async getRefrigerationById(id: number): Promise<Refrigeration | undefined> {
    return this.refrigerations.find(r => r.id === id);
  }

  async createRefrigeration(refrigeration: InsertRefrigeration): Promise<Refrigeration> {
    const newRefrigeration: Refrigeration = { ...refrigeration, id: this.refrigerationIdCounter++ };
    this.refrigerations.push(newRefrigeration);
    return newRefrigeration;
  }

  async updateRefrigeration(id: number, refrigeration: Partial<InsertRefrigeration>): Promise<Refrigeration | undefined> {
    const index = this.refrigerations.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.refrigerations[index] = { ...this.refrigerations[index], ...refrigeration };
    return this.refrigerations[index];
  }

  async deleteRefrigeration(id: number): Promise<boolean> {
    const index = this.refrigerations.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.refrigerations.splice(index, 1);
    return true;
  }

  async getSuppliers(): Promise<Supplier[]> {
    return this.suppliers;
  }

  async getSupplierById(id: number): Promise<Supplier | undefined> {
    return this.suppliers.find(s => s.id === id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const newSupplier: Supplier = { ...supplier, id: this.supplierIdCounter++ };
    this.suppliers.push(newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.suppliers[index] = { ...this.suppliers[index], ...supplier };
    return this.suppliers[index];
  }

  async deleteSupplier(id: number): Promise<boolean> {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.suppliers.splice(index, 1);
    return true;
  }

  async getCompanies(): Promise<Company[]> {
    return this.companies;
  }

  async getCompanyById(id: number): Promise<Company | undefined> {
    return this.companies.find(c => c.id === id);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const newCompany: Company = { ...company, id: this.companyIdCounter++ };
    this.companies.push(newCompany);
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const index = this.companies.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.companies[index] = { ...this.companies[index], ...company };
    return this.companies[index];
  }

  async deleteCompany(id: number): Promise<boolean> {
    const index = this.companies.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.companies.splice(index, 1);
    return true;
  }
}
