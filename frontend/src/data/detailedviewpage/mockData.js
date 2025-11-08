// Mock data for DetailedViewPage component

export const historyData = [
  { date: '2025-09-15', user: 'Mary Grace Piattos', actionDetails: 'Asset checked out for project work' },
  { date: '2025-08-20', user: 'Fernando Tempura', actionDetails: 'Regular maintenance checkout' },
  { date: '2025-07-10', user: 'Carlos Miguel Oishi', actionDetails: 'Quarterly audit checkout' },
  { date: '2025-06-05', user: 'John Smith', actionDetails: 'Maintenance work' },
  { date: '2025-05-12', user: 'Sarah Johnson', actionDetails: 'Project deployment' },
  { date: '2025-04-18', user: 'Mike Davis', actionDetails: 'Testing phase' },
  { date: '2025-03-22', user: 'Emma Wilson', actionDetails: 'Development work' },
];

export const componentsData = [
  { component: 'RAM Module 8GB', checkoutDate: '2025-09-15', user: 'Mary Grace Piattos', notes: 'Installed for upgrade', checkin: 'Pending' },
];

export const repairsData = [
  { asset: 'ASSET-001', type: 'Hardware', name: 'Screen Replacement', startDate: '2025-09-15', endDate: '2025-09-20', cost: '$150.00', status: 'Completed' },
];

export const auditsDuplicateData = {
  pending: [
    { id: 1, date: '2025-10-17', asset: { displayed_id: 'ASSET-001', name: 'Dell Latitude 7420 Laptop' }, created_at: '2025-09-01', notes: 'Pending audit' },
  ],
  overdue: [
    { id: 6, date: '2025-08-15', asset: { displayed_id: 'ASSET-006', name: 'Lenovo ThinkPad X1 Carbon' }, created_at: '2025-08-01', notes: 'Overdue audit' },
  ],
  scheduled: [
    { id: 8, date: '2025-11-20', asset: { displayed_id: 'ASSET-008', name: 'Microsoft Surface Pro 9' }, created_at: '2025-10-15', notes: 'Scheduled audit' },
  ],
  completed: [
    { id: 9, date: '2025-09-10', asset: { displayed_id: 'ASSET-010', name: 'HP Pavilion 15' }, created_at: '2025-09-10', notes: 'Completed audit' },
  ],
};

export const attachmentsData = [
  { uploaded: '2025-09-15', file: 'Asset_Manual.pdf', notes: 'User manual', delete: 'Delete' },
];

