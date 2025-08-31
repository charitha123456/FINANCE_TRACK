OVERVIEW OF APPLICATION:
               FINANCE_TRACK is a personal finance management web application that helps users track their income and expenses, visualize spending patterns, and extract financial data from receipts and PDF statements. Built using MERN (MongoDB,ExpressJS,ReactJS,NodeJS) Stack ,it provides an intuitive interface for managing personal finances.

Dependencies to install:
               Open New Terminal, 
               cd FINANCE_TRACK

# Install backend dependencies
               cd backend
               npm install

# Install frontend dependencies
               cd client
               npm install

Create .env file in backend directory 

place this in the .env file: 
               NODE_ENV=development
               PORT=5000
               MONGODB_URI=mongodb://localhost:27017/finance_assistant
               JWT_SECRET=secret

Database Setup:
               Open Atlas database in Chrome and create a new acoount in it and then create a new project finance_track ,create a new    cluster and then you will get the MONGODB_URI,Update MONGODB_URI in .env file.

Install OCR Dependencies:
               use this command in terminal(in macos) -> brew install tesseract 
               (in windows) -> Download and install Tesseract OCR from: https://github.com/UB-Mannheim/tesseract/wiki
                               Add Tesseract to your system PATH

RUN THE APPLICATION:
               Terminal 1 - Backend : npm run dev 
               Terminal 2 - Client : npm start
               you will get a link in the client terminal ,click on it ,u will be directed to the application page.
               Start using it!
If the port is already in use:
               Use this command(in windows):
               netstat -ano | findstr :5000
               taskkill /PID 1234 /F  # Replace 1234 with actual PID
               Use this command(in macos):
               lsof -i :5000 or lsof -ti:5000 
               kill -9 1234  # Replace 1234 with actual PID

BONUS FEATURES VERIFICATION:
               Tabular Format PDF Processing: Go to Upload page -> Select "PDF Statement" -> Upload bank statement PDF -> Extracts expenses and incomes from the pdf -> Gets reflected in Transactions.
               Pagination: Transactions page -> Add more than 10 transactions -> Scroll down -> U will see the next transactions in the second page.(10 Transactions per page)
               Support Multiple Users: Register two accounts -> Create transactions in each of them -> One can see only their own transactions in the application.

Application can be accesses through this link:
