import React from 'react';
import { products } from '@/lib/localStore.generated';

export default function DebugProducts() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Debug: Generated Products</h1>
      <p>Shows generated product handles, product_type and resolved image URL.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Handle</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Product Type</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Image</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{p.handle}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{p.product_type}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{p.images?.[0] || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
