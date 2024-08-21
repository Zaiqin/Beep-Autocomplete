import { useCallback, useEffect, useState } from "react";
import "./App.css";
import CurrencyInput from "./components/CurrencyInput";

type Currency = {
  name: string;
  rate: number;
};

interface CurrencyResponse {
  rates: { [key: string]: number };
}

function App() {
  const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>([]); // Selected Currencies
  const [currencyList, setCurrencyList] = useState<Currency[]>([]); // All currencies from axios
  const [inputText, setInputText] = useState<string>(""); // The input field contents
  const [loading, setLoading] = useState<boolean>(false); // Loading

  const [selectedCurrenciesTwo, setSelectedCurrenciesTwo] = useState<Currency[]>([]); // Selected Currencies
  const [currencyListTwo, setCurrencyListTwo] = useState<Currency[]>([]); // All currencies from axios
  const [inputTextTwo, setInputTextTwo] = useState<string>(""); // The input field contents
  const [loadingTwo, setLoadingTwo] = useState<boolean>(false); // Loading

  // Filter by name partially case insensitive
  const caseInsensitivePartialFilter = useCallback((options: Currency[], inputValue: string) => {
    return options.filter((option) =>
      option.name.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, []);

  // Filter by exact match case insensitive
  // const exactMatchFilter = useCallback((options: Currency[], inputValue: string) => {
  //   return options.filter(option => option.name.toLowerCase() === inputValue.toLowerCase());
  // }, []);

  // Filter by Exchange Rate
  const rateFilter = useCallback((options: Currency[], inputValue: string) => {
    return options.filter((option) =>
      option.rate.toString().substring(0,inputValue.length).includes(inputValue.substring(0,inputValue.length))
    );
  }, []);

  // One line row
  const oneLineRender = (option: Currency) => {
    return (<span className="text-gray-800">{option.name} - {option.rate.toFixed(2)}</span>)
  }

  // two line row
  const twoLinesRender = (option: Currency) => {
    return (
      <>
        <div className="flex flex-col ml-1 rounded-md items-start">
          <div className="mb-1">
            <span className="text-gray-800 font-semibold">{option.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Rate: {option.rate.toFixed(2)}</span>
          </div>
        </div>
      </>
    )
  }

  // For first currency input

  const handleOnChange = (value: Currency[]) => {
    setSelectedCurrencies(value);
  };
  
  const handleInputChange = (value: string) => {
    setInputText(value);
  };

  useEffect(() => {
    if (selectedCurrencies.length > 0) console.log(selectedCurrencies)
  }, [selectedCurrencies])
  
  // For second Currency Input

  const handleOnChangeTwo = (value: Currency[]) => {
    setSelectedCurrenciesTwo(value);
  };
  
  const handleInputChangeTwo = (value: string) => {
    setInputTextTwo(value);
  };

  useEffect(() => {
    if (selectedCurrenciesTwo.length > 0) console.log(selectedCurrenciesTwo)
  }, [selectedCurrenciesTwo])
  

  // Fetch currencies from the public API using fetch
  useEffect(() => {
    const fetchCurrencies = async () => {
      setLoading(true);
      setLoadingTwo(true)
      try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/SGD");
        if (!response.ok) {
          throw new Error("Failed to fetch currencies");
        }
        const data: CurrencyResponse = await response.json();
        const currencies = Object.keys(data.rates).map((name) => ({
          name,
          rate: data.rates[name],
        }));
        setCurrencyList(currencies);
        setCurrencyListTwo(currencies)
      } catch (error) {
        console.error("Error fetching currencies:", error);
      } finally {
        setLoading(false);
        setLoadingTwo(false)
      }
    };
    fetchCurrencies();
  }, []);

  return (
    <>
      <div className="flex-5 p-4 border border-blue-100 bg-white rounded-md">
        <CurrencyInput
          description="With case insensitive filter, multi-select and 2 rows display"  
          disabled={false}  
          filterOptions={caseInsensitivePartialFilter} 
          label="Currency Selector"  
          loading={loading}  
          multiple={true}  
          onChange={handleOnChange}  
          onInputChange={handleInputChange}  
          options={currencyList}  
          placeholder="Search currency..."  
          renderOption={twoLinesRender}  
          value={selectedCurrencies}  
          inputText={inputText}  
        />
        <CurrencyInput
          description="With currency rate filter, single select and 1 row display"  
          disabled={false}  
          filterOptions={rateFilter}  
          label="Currency Rate Selector"  
          loading={loadingTwo}  
          multiple={false}  
          onChange={handleOnChangeTwo}  
          onInputChange={handleInputChangeTwo}  
          options={currencyListTwo}  
          placeholder="Search currency..."  
          renderOption={oneLineRender}  
          value={selectedCurrenciesTwo}  
          inputText={inputTextTwo}  
        />
      </div>
    </>
  );  
}

export default App;