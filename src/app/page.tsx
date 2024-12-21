"use client";

import { Button } from "../app/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../app/ui/card";
import "firebase/auth"; // Import for authentication
import "firebase/database"; // Import for Realtime Database
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Auth } from "./components/auth";
import { database, auth } from "./firebaseConfig";

const SpendingTracker = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [view, setView] = useState("input"); // 'input' or 'summary'
  const [expenses, setExpenses] = useState([]);
  const [bills, setBills] = useState([]);
  const [updatedAmt, setUpdatedAmt] = useState("");
  const billsCollectionRef = collection(database, "bills");

  const getBill = async () => {
    try {
      const data = await getDocs(billsCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setBills(filteredData);
      console.log(filteredData);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    getBill();
  }, [expenses]);

  // Categories for spending
  const categories = [
    { id: "food", label: "Food & Dining" },
    { id: "transport", label: "Transportation" },
    { id: "shopping", label: "Shopping" },
    { id: "utilities", label: "Utilities" },
    { id: "other", label: "Other" },
  ];

  const handleNumberClick = (num: string) => {
    if (num === "backspace") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (num === ".") {
      if (!amount.includes(".")) {
        setAmount((prev) => prev + ".");
      }
    } else {
      setAmount((prev) => prev + num);
    }
  };

  const handleSubmit = async () => {
    if (!amount) return;

    const newExpense = {
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
    };

    setExpenses((prev) => [...prev, newExpense]);
    setAmount("");

    try {
      console.log("Document written successfully");
      console.log(auth.currentUser.uid);
      await addDoc(billsCollectionRef, {
        ...newExpense,
        userId: auth?.currentUser?.uid ?? "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBill = async (id: string) => {
    const billDoc = doc(database, "bills", id);

    const newExpense = {
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
    };
    try {
      await deleteDoc(billDoc);
      getBill();
    } catch (err) {
      console.error(err);
    }
  };

  const updateAmt = async (id: string) => {
    const billDoc = doc(database, "bills", id);
    const taskSnapshot = await getDoc(billDoc);

    setUpdatedAmt("");
    try {
      await updateDoc(billDoc, { ...taskSnapshot, amount: updatedAmt });
    } catch (error) {
      console.error(error);
    }
  };

  // Calculate monthly summary
  const monthlySummary = expenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleDateString("en-US", {
      month: "short",
    });
    acc[month] = (acc[month] || 0) + expense.amount;
    return acc;
  }, {});

  const chartData = Object.entries(monthlySummary).map(([month, total]) => ({
    month,
    total,
  }));

  return (
    <div className="max-w-md mx-auto p-4">
      {view === "input" ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Amount Display */}
            <div className="text-4xl text-center mb-4 font-mono min-h-16">
              ${amount || "0"}
            </div>

            {/* Category Selection */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? "default" : "outline"}
                  onClick={() => setCategory(cat.id)}
                  className="w-full"
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "backspace"].map((num) => (
                <Button
                  key={num}
                  onClick={() => handleNumberClick(num as string)}
                  variant="outline"
                  className="h-12 text-xl"
                >
                  {num === "backspace" ? "←" : num}
                </Button>
              ))}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full mt-4"
              disabled={!amount}
            >
              Add Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              <BarChart width={320} height={240} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Toggle */}
      <Button
        onClick={() => setView((v) => (v === "input" ? "summary" : "input"))}
        className="w-full mt-4"
      >
        Show {view === "input" ? "Summary" : "Input"}
      </Button>

      <div>
        <Auth />

        <div>
          {bills.map((bill) => (
            <div key={bill.id}>
              <span>{bill.category}</span>
              <div> {bill.amount}</div>
              <input
                placeholder="update amount..."
                onChange={(e) => setUpdatedAmt(e.target.value)}
              />
              <button onClick={() => updateAmt(bill.id)}>Update</button>
              <button onClick={() => deleteBill(bill.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpendingTracker;
