export type Client = {
  id: string;
  name: string;
  document?: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  locations?: { id: string; name: string }[];
};

export type ChecklistItem = {
  id: string;
  task: string;
  category: string;
  clientId?: string;
  clientIds?: string[];
};

export type TicketType = 'PREVENTIVA' | 'CORRETIVA' | 'TAREFA';

export type TicketStatus = 'PENDENTE_APROVACAO' | 'APROVADO' | 'AGUARDANDO_MATERIAL' | 'REALIZANDO' | 'CONCLUIDO' | 'REJEITADO';

export type QuoteItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Quote = {
  id: string;
  clientId: string;
  date: string;
  items: QuoteItem[];
  totalValue: number;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
};

export type Receipt = {
  id: string;
  clientId: string;
  date: string;
  value: number;
  description: string;
};

export type Cost = {
  id: string;
  description: string;
  value: number;
  date: string;
  category: string;
};

export type SavingsGoal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  icon: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
};

export type Appointment = {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'TICKET' | 'MEETING' | 'OTHER';
  ticketId?: string;
  notes?: string;
};

export type Ticket = {
  id: string;
  osNumber?: string;
  title?: string;
  type: TicketType;
  status?: TicketStatus;
  maintenanceCategory?: string;
  maintenanceSubcategory?: string;
  clientId?: string;
  date: string;
  technician: string;
  observations: string;
  color?: string;
  reportedBy?: string;
  location?: string;
  photoBefore?: string;
  budgetAmount?: number;
  budgetApproved?: boolean;
  reportedProblem?: string;
  productsForQuote?: string;
  serviceReport?: string;
  checklistResults?: {
    taskId: string;
    status: 'OK' | 'NOK' | 'NA';
    notes: string;
  }[];
  images?: string[];
  history?: {
    id: string;
    date: string;
    note: string;
    userName?: string;
  }[];
};

export type CompanyData = {
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
};

export type Product = {
  id: string;
  code?: string;
  name: string;
  description?: string;
  price: number;
  unit?: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  category: 'LIMPEZA' | 'PISCINA' | 'GERAL';
};

export type SupplyItem = {
  id: string;
  name: string;
  category: 'LIMPEZA' | 'PISCINA';
  currentStock: number;
  minStock: number;
  unit: string;
  lastPrice?: number;
  clientId?: string;
};

export type SupplyQuotation = {
  id: string;
  date: string;
  items: {
    supplyItemId: string;
    quantity: number;
  }[];
  responses: {
    supplierId: string;
    prices: { [supplyItemId: string]: number };
    status: 'PENDING' | 'RECEIVED';
  }[];
  status: 'OPEN' | 'CLOSED';
};

export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export type Payment = {
  id: string;
  clientId: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: PaymentStatus;
  reference: string;
};

export type LegalAgreement = {
  id: string;
  clientId: string;
  totalAmount: number;
  installments: number;
  remainingInstallments: number;
  status: 'ACTIVE' | 'COMPLETED' | 'BREACHED';
  startDate: string;
  notes?: string;
};

export type ScheduledMaintenance = {
  id: string;
  clientId: string;
  standardId: string;
  item: string;
  frequency: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  lastDone?: string;
  nextDate: string;
  status: 'PENDING' | 'DONE' | 'OVERDUE';
  category: string;
};

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  link?: string;
};

export type ConsumptionReading = {
  id: string;
  clientId: string;
  type: 'WATER' | 'GAS';
  previousValue: number;
  currentValue: number;
  consumption: number;
  date: string;
  unit: string;
  billed: boolean;
};

export type Vote = {
  id: string;
  userId: string;
  userName: string;
  optionId: string;
  timestamp: string;
  signature: string;
};

export type AssemblyOption = {
  id: string;
  text: string;
};

export type Assembly = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'UPCOMING' | 'ACTIVE' | 'CLOSED';
  options: AssemblyOption[];
  votes: Vote[];
  legalValidityHash: string;
};

export type DigitalFolderItem = {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  date: string;
  amount?: number;
  fileUrl: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  signatures: {
    id: string;
    userName: string;
    role: string;
    date: string;
  }[];
};

export type Notice = {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'MAINTENANCE' | 'EVENT' | 'GENERAL' | 'SECURITY';
  tower?: string;
  apartmentLine?: string;
  clientId: string;
};

export type Package = {
  id: string;
  residentName: string;
  apartment: string;
  tower: string;
  carrier: string;
  trackingCode?: string;
  receivedAt: string;
  pickedUpAt?: string;
  status: 'PENDING' | 'PICKED_UP';
  qrCode: string;
  photoUrl?: string;
  clientId?: string;
};

export type Visitor = {
  id: string;
  name: string;
  document?: string;
  type: 'VISITOR' | 'SERVICE_PROVIDER';
  apartment: string;
  tower: string;
  validUntil: string;
  qrCode: string;
  status: 'ACTIVE' | 'EXPIRED' | 'USED';
};

export type CriticalEvent = {
  id: string;
  device: string;
  location: string;
  type: 'PUMP' | 'DOOR' | 'FIRE' | 'ELECTRICAL';
  status: 'NORMAL' | 'ALERT' | 'CRITICAL';
  lastUpdate: string;
  description: string;
};

export type EnergyRecord = {
  month: string;
  consumption: number;
  solarGeneration: number;
  sensorSavings: number;
  costWithoutTech: number;
  actualCost: number;
};

export type DocumentTemplate = {
  id: string;
  title: string;
  category: string;
  description: string;
  legalBasis: string;
  content: string;
  fileUrl?: string;
};

export interface AppState {
  clients: Client[];
  checklistItems: ChecklistItem[];
  tickets: Ticket[];
  quotes: Quote[];
  receipts: Receipt[];
  costs: Cost[];
  appointments: Appointment[];
  products: Product[];
  suppliers: Supplier[];
  supplyItems: SupplyItem[];
  supplyQuotations: SupplyQuotation[];
  payments: Payment[];
  legalAgreements: LegalAgreement[];
  scheduledMaintenances: ScheduledMaintenance[];
  notifications: AppNotification[];
  consumptionReadings: ConsumptionReading[];
  digitalFolder: DigitalFolderItem[];
  assemblies: Assembly[];
  notices: Notice[];
  packages: Package[];
  visitors: Visitor[];
  criticalEvents: CriticalEvent[];
  energyData: EnergyRecord[];
  savingsGoals: SavingsGoal[];
  companyLogo: string | null;
  companySignature: string | null;
  companyData: CompanyData | null;
  companySettingsId: string | null;
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  menuOrder: string[];
  hiddenTiles: string[];
  tileSizes: { [key: string]: 'small' | 'medium' | 'large' };
  tileOrder: string[] | null;
  documentTemplates: DocumentTemplate[];
  isLoading: boolean;
  
  fetchInitialData: () => Promise<void>;
  setCompanyLogo: (logo: string | null) => Promise<void>;
  setCompanySignature: (signature: string | null) => Promise<void>;
  setCompanyData: (data: CompanyData) => Promise<void>;
  setMenuOrder: (order: string[]) => Promise<void>;
  setTileSizes: (sizes: { [key: string]: 'small' | 'medium' | 'large' }) => Promise<void>;
  setTileOrder: (order: string[]) => Promise<void>;
  toggleTileVisibility: (tileId: string) => void;
  toggleTheme: () => Promise<void>;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, client: Omit<Client, 'id'>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  addChecklistItem: (item: Omit<ChecklistItem, 'id'>) => void;
  updateChecklistItem: (id: string, item: Omit<ChecklistItem, 'id'>) => void;
  deleteChecklistItem: (id: string) => void;
  
  addTicket: (ticket: Omit<Ticket, 'id'>) => void;
  updateTicket: (id: string, ticket: Omit<Ticket, 'id'>) => void;
  deleteTicket: (id: string) => void;

  addQuote: (quote: Omit<Quote, 'id'>) => void;
  updateQuote: (id: string, quote: Omit<Quote, 'id'>) => void;
  deleteQuote: (id: string) => void;

  addReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  updateReceipt: (id: string, receipt: Omit<Receipt, 'id'>) => void;
  deleteReceipt: (id: string) => void;

  addCost: (cost: Omit<Cost, 'id'>) => void;
  updateCost: (id: string, cost: Omit<Cost, 'id'>) => void;
  deleteCost: (id: string) => void;

  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appointment: Omit<Appointment, 'id'>) => void;
  deleteAppointment: (id: string) => void;

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  importProducts: (products: Omit<Product, 'id'>[]) => void;
  
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Omit<Supplier, 'id'>) => void;
  deleteSupplier: (id: string) => void;

  addSupplyItem: (item: Omit<SupplyItem, 'id'>) => void;
  updateSupplyItem: (id: string, item: Omit<SupplyItem, 'id'>) => void;
  deleteSupplyItem: (id: string) => void;
  updateStock: (id: string, quantity: number) => void;

  createQuotation: (items: { supplyItemId: string; quantity: number }[]) => void;
  updateQuotationResponse: (quotationId: string, supplierId: string, prices: { [key: string]: number }) => void;
  
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  addLegalAgreement: (agreement: Omit<LegalAgreement, 'id'>) => void;
  updateLegalAgreement: (id: string, agreement: Partial<LegalAgreement>) => void;
  deleteLegalAgreement: (id: string) => void;

  addScheduledMaintenance: (maintenance: Omit<ScheduledMaintenance, 'id'>) => void;
  updateScheduledMaintenance: (id: string, maintenance: Partial<ScheduledMaintenance>) => void;
  deleteScheduledMaintenance: (id: string) => void;
  generateSchedulesForClient: (clientId: string) => void;
  
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  addConsumptionReading: (reading: Omit<ConsumptionReading, 'id'>) => void;
  addDigitalFolderItem: (item: Omit<DigitalFolderItem, 'id' | 'signatures' | 'status'>) => void;
  validateDigitalFolderItem: (id: string, userName: string, role: string) => void;
  addAssembly: (assembly: Omit<Assembly, 'id' | 'votes' | 'legalValidityHash'>) => void;
  castVote: (assemblyId: string, optionId: string, userName: string) => void;
  closeAssembly: (id: string) => void;
  deleteAssembly: (id: string) => void;

  addNotice: (notice: Omit<Notice, 'id' | 'date'>) => void;
  updateNotice: (id: string, notice: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;

  addPackage: (pkg: Omit<Package, 'id' | 'receivedAt' | 'status' | 'qrCode'>) => Promise<Package>;
  pickupPackage: (id: string) => void;
  
  addVisitor: (visitor: Omit<Visitor, 'id' | 'qrCode' | 'status'>) => void;
  revokeVisitor: (id: string) => void;

  updateCriticalEvent: (id: string, status: CriticalEvent['status'], description: string) => void;
  addTicketHistory: (ticketId: string, note: string, userName?: string) => void;
  setEnergyData: (data: EnergyRecord[]) => void;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  addDocumentTemplate: (template: Omit<DocumentTemplate, 'id'>) => Promise<void>;
  updateDocumentTemplate: (id: string, template: Partial<DocumentTemplate>) => Promise<void>;
  deleteDocumentTemplate: (id: string) => Promise<void>;

  restoreData: (data: Partial<AppState>) => void;
}
