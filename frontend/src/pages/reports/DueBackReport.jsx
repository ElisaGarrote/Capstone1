import { useState } from 'react';
import NavBar from '../../components/NavBar';
import Table from '../../components/Table';
import MediumButtons from '../../components/buttons/MediumButtons';
import { RxPerson } from 'react-icons/rx';
import '../../styles/Reports.css';
import '../../styles/UpcomingEndOfLife.css';

export default function DueBackReport() {
  const [searchQuery, setSearchQuery] = useState('');

  const columns = [
    { header: 'ASSET', accessor: 'asset' },
    { header: 'CHECKED OUT BY', accessor: 'checkedOutBy' },
    { header: 'CHECKED OUT TO', accessor: 'checkedOutTo' },
    { header: 'CHECKED DATE', accessor: 'checkedDate' },
    { header: 'DUE BACK DATE', accessor: 'dueBackDate' },
    { header: 'CHECKOUT NOTES', accessor: 'checkoutNotes' }
  ];

  const data = [
    {
      asset: { id: '100000', name: 'Macbook Pro 16"' },
      checkedOutBy: 'Mary Grace Piatos',
      checkedOutTo: 'Miggy Mango',
      checkedDate: 'March 29, 2025',
      dueBackDate: 'May 29, 2025',
      checkoutNotes: '-'
    },
    {
      asset: { id: '100034', name: 'XPS 13"' },
      checkedOutBy: 'Mary Grace Piatos',
      checkedOutTo: 'Jay Kamote',
      checkedDate: 'March 24, 2025',
      dueBackDate: 'May 24, 2025',
      checkoutNotes: '-'
    }
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search functionality
  };

  return (
    <>
      <NavBar />
      <main className="reports-page">
        <div className="reports-container">
          <h1>Due Back Report</h1>
          
          <div className="table-container">
            <div className="table-header">
              <div className="header-left">
                <h2>Assets (2)</h2>
              </div>
              <div className="header-right">
                <input
                  type="text"
                  placeholder="Search..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <MediumButtons type="export" navigatePage="" />
              </div>
            </div>
            
            <Table 
              columns={columns} 
              data={data}
              renderCell={(column, item) => {
                if (column.accessor === 'asset') {
                  return (
                    <div className="asset-cell">
                      <a href={`#${item.asset.id}`} className="asset-link">
                        {item.asset.id} - {item.asset.name}
                      </a>
                    </div>
                  );
                }
                if (column.accessor === 'checkedOutTo') {
                  return (
                    <div className="user-info">
                      <RxPerson className="user-icon" />
                      <a href="#" className="user-link">{item.checkedOutTo}</a>
                    </div>
                  );
                }
                return item[column.accessor];
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
} 