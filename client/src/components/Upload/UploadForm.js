import React, { useState } from 'react';
import api from '../../services/api';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('receipt');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setResult(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const endpoint = fileType === 'receipt' ? '/upload/receipt' : '/upload/pdf';
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-form">
      <h2>Upload {fileType === 'receipt' ? 'Receipt' : 'PDF Statement'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>File Type</label>
          <select 
            value={fileType} 
            onChange={(e) => setFileType(e.target.value)}
          >
            <option value="receipt">Receipt Image</option>
            <option value="pdf">PDF Statement</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>File</label>
          <input
            type="file"
            accept={fileType === 'receipt' ? 'image/*' : 'application/pdf'}
            onChange={handleFileChange}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Upload and Process'}
        </button>
      </form>
      
      {result && (
        <div className="upload-result">
          <h3>Processing Results</h3>
          <p>{result.message}</p>
          
          {fileType === 'receipt' && result.transaction && (
            <div className="extracted-data">
              <h4>Extracted Transaction</h4>
              <p><strong>Amount:</strong> ${result.transaction.amount}</p>
              <p><strong>Category:</strong> {result.transaction.category}</p>
              <p><strong>Date:</strong> {new Date(result.transaction.date).toLocaleDateString()}</p>
            </div>
          )}
          
          {fileType === 'pdf' && result.transactions && (
            <div className="extracted-data">
              <h4>Extracted Transactions: {result.transactions.length}</h4>
              <ul>
                {result.transactions.slice(0, 5).map((transaction, index) => (
                  <li key={index}>
                    {new Date(transaction.date).toLocaleDateString()} - 
                    {transaction.description} - 
                    ${transaction.amount}
                  </li>
                ))}
                {result.transactions.length > 5 && <li>...and {result.transactions.length - 5} more</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadForm;



// import React, { useState } from 'react';
// import api from '../../services/api';

// const UploadForm = () => {
//   const [file, setFile] = useState(null);
//   const [fileType, setFileType] = useState('receipt');
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState('');

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//       setError('');
//       console.log('File selected:', selectedFile.name, 'Type:', selectedFile.type);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!file) {
//       setError('Please select a file');
//       return;
//     }
    
//     // Enhanced file type validation
//     const fileExtension = file.name.split('.').pop().toLowerCase();
    
//     if (fileType === 'receipt') {
//       const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
//       if (!imageExtensions.includes(fileExtension) && !file.type.startsWith('image/')) {
//         setError('Please select an image file (JPEG, PNG, GIF, etc.) for receipts');
//         return;
//       }
//     } else if (fileType === 'pdf') {
//       if (fileExtension !== 'pdf' && file.type !== 'application/pdf') {
//         setError('Please select a PDF file for statements');
//         return;
//       }
//     }
    
//     try {
//       setLoading(true);
//       setError('');
//       setResult(null);
      
//       const formData = new FormData();
//       formData.append('file', file);
      
//       const endpoint = fileType === 'receipt' ? '/upload/receipt' : '/upload/pdf';
//       console.log('Uploading to:', endpoint, 'File:', file.name, 'Type:', file.type);
      
//       const response = await api.post(endpoint, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           console.log(`Upload progress: ${percentCompleted}%`);
//         }
//       });
      
//       setResult(response.data);
//       console.log('Upload successful:', response.data);
      
//     } catch (error) {
//       console.error('Upload error details:', error);
//       if (error.response) {
//         setError(error.response.data.message || 'Server error during upload');
//       } else if (error.request) {
//         setError('Network error. Please check your connection.');
//       } else {
//         setError('Error uploading file: ' + error.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="upload-form">
//       <h2>Upload {fileType === 'receipt' ? 'Receipt' : 'PDF Statement'}</h2>
      
//       {error && <div className="error-message">{error}</div>}
      
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label>File Type</label>
//           <select 
//             value={fileType} 
//             onChange={(e) => {
//               setFileType(e.target.value);
//               setFile(null);
//               setError('');
//             }}
//           >
//             <option value="receipt">Receipt Image</option>
//             <option value="pdf">PDF Statement</option>
//           </select>
//         </div>
        
//         <div className="form-group">
//           <label>File</label>
//           <input
//             type="file"
//             accept={fileType === 'receipt' ? 'image/*' : '.pdf,application/pdf'}
//             onChange={handleFileChange}
//             required
//           />
//           {file && (
//             <div className="file-info">
//               <p><strong>Selected:</strong> {file.name}</p>
//               <p><strong>Type:</strong> {file.type || 'unknown'}</p>
//               <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
//             </div>
//           )}
//         </div>
        
//         <button type="submit" disabled={loading || !file}>
//           {loading ? 'Processing...' : 'Upload and Process'}
//         </button>
//       </form>
      
//       {loading && (
//         <div className="loading">
//           <p>Uploading file... Please wait.</p>
//         </div>
//       )}
      
//       {result && (
//         <div className="upload-result">
//           <h3>Processing Results</h3>
//           <p>{result.message}</p>
          
//           {fileType === 'receipt' && result.transaction && (
//             <div className="extracted-data">
//               <h4>Extracted Transaction</h4>
//               <p><strong>Amount:</strong> ${result.transaction.amount}</p>
//               <p><strong>Category:</strong> {result.transaction.category}</p>
//               <p><strong>Date:</strong> {new Date(result.transaction.date).toLocaleDateString()}</p>
//             </div>
//           )}
          
//           {fileType === 'pdf' && result.transactions && (
//             <div className="extracted-data">
//               <h4>Extracted Transactions: {result.transactions.length}</h4>
//               <ul>
//                 {result.transactions.slice(0, 5).map((transaction, index) => (
//                   <li key={index}>
//                     {new Date(transaction.date).toLocaleDateString()} - 
//                     {transaction.description} - 
//                     ${transaction.amount}
//                   </li>
//                 ))}
//                 {result.transactions.length > 5 && <li>...and {result.transactions.length - 5} more</li>}
//               </ul>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default UploadForm;