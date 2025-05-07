import React from 'react';
import NavBar from '../../components/NavBar';
import Status from '../../components/Status';
import MediumButtons from '../../components/buttons/MediumButtons';
import '../../styles/Reports.css';
import '../../styles/UpcomingEndOfLife.css';

const DepreciationReport = () => {
  const assets = [
    {
      id: '100000',
      name: 'Macbook Pro 16"',
      status: { type: 'deployable', name: 'Ready to Deploy' },
      depreciation: 'Laptop Depreciation',
      duration: '36 months',
      minimumValue: 10000,
      purchaseCost: 90000,
      currentValue: 80000,
      depreciated: 10000,
      monthlyDepreciation: 300,
      monthlyLeft: 34
    },
    {
      id: '100001',
      name: 'Macbook Pro 16"',
      status: { type: 'undeployable', name: 'Temporarily Undeployable', subtext: '3 Months' },
      depreciation: 'Laptop Depreciation',
      duration: '36 months',
      minimumValue: 10000,
      purchaseCost: 90000,
      currentValue: 80000,
      depreciated: 10000,
      monthlyDepreciation: 300,
      monthlyLeft: 34
    }
  ];

  const formatCurrency = (value) => {
    return `₱ ${value.toLocaleString()}`;
  };

  return (
    <>
      <NavBar />
      <main className="reports-page">
        <div className="reports-container">
          <h1>Depreciation Report</h1>

          <div className="table-container">
            <div className="table-header">
              <div className="header-left">
                <h2>Overdue for an Audit</h2>
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
              <table className="table depreciation-table">
                <thead>
                  <tr>
                    <th>ASSET</th>
                    <th>STATUS</th>
                    <th>DEPRECIATION</th>
                    <th>DURATION</th>
                    <th>MINIMUM VALUE</th>
                    <th>PURCHASE COST</th>
                    <th>CURRENT VALUE</th>
                    <th>DEPRECIATED</th>
                    <th>MONTHLY DEPRECIATION</th>
                    <th>MONTHLY LEFT</th>
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
                          subtext={asset.status.subtext}
                        />
                      </td>
                      <td>{asset.depreciation}</td>
                      <td>{asset.duration}</td>
                      <td>{formatCurrency(asset.minimumValue)}</td>
                      <td>{formatCurrency(asset.purchaseCost)}</td>
                      <td>{formatCurrency(asset.currentValue)}</td>
                      <td>{formatCurrency(asset.depreciated)}</td>
                      <td>{formatCurrency(asset.monthlyDepreciation)}</td>
                      <td>{asset.monthlyLeft}</td>
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

export default DepreciationReport;