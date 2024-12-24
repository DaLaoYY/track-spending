"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "firebase/auth"; // Import for authentication
import "firebase/database"; // Import for Realtime Database
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { database, auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next"; // Import i18next hook
import "../i18n"; // Import i18n initialization here

const SpendingTracker = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [view, setView] = useState("input"); // 'input' or 'summary'
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Replace with `useHistory` in plain React
  const [user, setUser] = useState(null); // To store user details
  const [spendingRecordsRef, setSpendingRecordsRef] = useState(null);
  const { t, i18n } = useTranslation(); // Use i18next translation hook

  useEffect(() => {
    if (spendingRecordsRef) {
      getSpendingRecords();
    }
  }, [spendingRecordsRef]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        });
        setSpendingRecordsRef(
          collection(database, "users", auth.currentUser.uid, "spendingRecords")
        );
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const getSpendingRecords = async () => {
    const snapshot = await getDocs(spendingRecordsRef);
    const records = snapshot.docs.map((doc) => ({
      data: doc.data(),
      id: doc.id,
    }));
    setExpenses(records);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleLanguageChange = (language) => {
    i18n
      .changeLanguage(language) // This will switch language dynamically
      .catch((err) => console.error("Error changing language:", err));
  };

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
    if (!amount || !spendingRecordsRef) return;

    const newExpense = {
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
    };

    setAmount("");

    try {
      if (spendingRecordsRef) {
        await addDoc(spendingRecordsRef, newExpense);
        getSpendingRecords();
      }
    } catch (error) {
      alert("add expense failed");
    }
  };
  const deleteSpend = async (id: string) => {
    if (spendingRecordsRef) {
      const recordDocRef = doc(spendingRecordsRef, id);
      try {
        await deleteDoc(recordDocRef);
        getSpendingRecords();
      } catch (error) {
        alert("delete failed");
      }
    }
  };

  // Calculate monthly summary
  const monthlySummary = expenses.reduce((acc, expense) => {
    const month = new Date(expense.data.date).toLocaleDateString("en-US", {
      month: "short",
    });
    acc[month] = (acc[month] || 0) + expense.data.amount;
    return acc;
  }, {});

  const chartData = Object.entries(monthlySummary).map(([month, total]) => ({
    month,
    total,
  }));

  if (loading) {
    // Show a loading indicator while checking authentication status
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header Section */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {user?.photo && (
            <img
              src={user.photo}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <h2 className="text-lg font-semibold">{user?.name}</h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {/* Language Dropdown */}
          <select
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="border p-2 rounded"
            defaultValue={i18n.language}
          >
            <option value="cn">中文</option>
            <option value="en">EN</option>
            {/* Add more languages as needed */}
          </select>

          <Button onClick={handleSignOut} variant="outline">
            {t("signOut")} {/* Use translation for sign out */}
          </Button>
        </div>
      </header>
      {/* Main Content */}
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
                  {t(cat.id)}
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
              {t("addExpense")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
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
          <div>
            <div>
              {expenses.map((bill, i) => (
                <div className="flex justify-between items-center mt-4" key={i}>
                  <span>{t(bill.data.category)}</span>
                  <div> {bill.data.amount}</div>
                  {/* <input
                    placeholder="update amount..."
                    onChange={(e) => setUpdatedAmt(e.target.value)}
                  />
                  <button onClick={() => updateAmt(bill.id)}>
                    {t("update")}
                  </button> */}
                  <button onClick={() => deleteSpend(bill.id)}>
                    {t("delete")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {/* View Toggle */}
      <Button
        onClick={() => setView((v) => (v === "input" ? "summary" : "input"))}
        className="w-full mt-4"
      >
        {view === "input" ? t("summary") : t("input")}
      </Button>
    </div>
  );
};

export default SpendingTracker;
