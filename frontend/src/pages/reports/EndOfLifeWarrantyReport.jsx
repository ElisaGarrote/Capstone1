import React from 'react';
import NavBar from '../../components/NavBar';
import Status from '../../components/Status';
import MediumButtons from '../../components/buttons/MediumButtons';
import '../../styles/Reports.css';
import '../../styles/UpcomingEndOfLife.css';

const EndOfLifeWarrantyReport = () => {
  const assets = [
    {
      id: '100000',
      name: 'Macbook Pro 16"',
      status: { type: 'deployed', name: 'Deployed to', person: 'Pla Platos-Lim' },
      location: 'Makati',
      endOfLifeDate: 'March 29, 2025',
      warrantyExpirationDate: 'May 29, 2025'
    },
    {
      id: '100034',
      name: 'XPS 13"',
      status: { type: 'deployable', name: 'Ready to Deploy' },
      location: 'Makati',
      endOfLifeDate: 'March 24, 2025',
      warrantyExpirationDate: 'May 24, 2025'
    }
  ];

  return (
    <>
      <NavBar />
      <main className="reports-page">
        <div className="reports-container">
          <h1>End of Life & Warranty Report</h1>
          
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
                />
                <MediumButtons type="export" navigatePage="" />
              </div>
            </div>
            
            <div className="table-scroll-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ASSET</th>
                    <th>STATUS</th>
                    <th>LOCATION</th>
                    <th>END OF LIFE DATE</th>
                    <th>WARRANTY EXPIRATION DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <div className="asset-cell">
                          <a href={`#${asset.id}`} className="asset-link">
                            {asset.id} - {asset.name}
                          </a>
                        </div>
                      </td>
                      <td>
                        <Status
                          type={asset.status.type}
                          name={asset.status.name}
                          personName={asset.status.person}
                        />
                      </td>
                      <td>{asset.location}</td>
                      <td>{asset.endOfLifeDate}</td>
                      <td>{asset.warrantyExpirationDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default EndOfLifeWarrantyReport; 