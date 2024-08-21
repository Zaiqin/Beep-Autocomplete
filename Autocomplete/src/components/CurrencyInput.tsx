import React, { useState, useEffect, useRef } from "react";
import { useFloating, shift, offset } from "@floating-ui/react";
import "tailwindcss/tailwind.css";
import "./currencyInput.css";
import LoadingGif from "../assets/loading.gif";
import SearchIcon from "../assets/search.png";

type Currency = {
  name: string;
  rate: number;
};

interface CurrencyInputProps {
  description?: string;
  disabled?: boolean;
  filterOptions?: (options: Currency[], inputValue: string) => Currency[];
  label?: string;
  loading?: boolean;
  multiple?: boolean;
  onChange?: (value: Currency[]) => void;
  onInputChange?: (value: string) => void;
  options: Currency[];
  placeholder?: string;
  renderOption?: (option: Currency) => React.ReactNode;
  value: Currency[];
  inputText: string;
}

const CurrencyInput = ({
  description,
  disabled,
  filterOptions,
  label,
  loading,
  multiple,
  onChange,
  onInputChange,
  options,
  placeholder,
  renderOption,
  inputText,
}: CurrencyInputProps) => {
  const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>([]); // All the currencies
  const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>([]); // Currencies that are selected
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // store dropdown state
  const [isLoading, setLoading] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null); // The component ref
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Debounce timer
  const listRef = useRef<HTMLDivElement>(null); // dropdown list ref
  const arrowRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { x, y, strategy, refs } = useFloating({
    middleware: [offset(4), shift({ padding: 8 })],
  });

  // Change in inputText
  useEffect(() => {
    inputText ? setLoading(true) : setLoading(false);
    // Clear any existing timer when inputText changes
    if (timerRef.current) clearTimeout(timerRef.current);

    // 500 ms debounce time, set to timerRef
    timerRef.current = setTimeout(() => {
      dropdownFunction();
    }, 500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [inputText]);

  const dropdownFunction = () => {
    setIsDropdownOpen(false);
    if (inputText != "") {
      console.log("Filtering");
      setIsDropdownOpen(true);
      const filtered = inputText == "" ? options : 
      filterOptions ? filterOptions(options, inputText) : 
      options.filter((currency) => currency.name.toLowerCase().includes(inputText.toLowerCase()));
      setHighlightedIndex(-1)
      setFilteredCurrencies(filtered);
      setLoading(false);
    }
  };

  const handleKeyDown = (event: { key: string; }) => {

    // Clear any existing timer when inputText changes
    if (arrowRef.current) clearTimeout(arrowRef.current);

    arrowRef.current = setTimeout(() => {
      if (isDropdownOpen) {
        //console.log(highlightedIndex, filteredCurrencies)
        if (event.key === 'ArrowDown') {
          setHighlightedIndex((prevIndex) =>
            prevIndex < filteredCurrencies.length - 1 ? prevIndex + 1 : 0
          );
        } else if (event.key === 'ArrowUp') {
          setHighlightedIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : filteredCurrencies.length-1
          );
        } else if (event.key === 'Enter') {
          if (highlightedIndex >= 0 && highlightedIndex < filteredCurrencies.length) {
            handleCurrencySelect(filteredCurrencies[highlightedIndex]);
          }
        } else if (event.key === 'Escape') {
          setIsDropdownOpen(false);
        }
      }
    }, 150);

    return () => {
      if (arrowRef.current) {
        clearTimeout(arrowRef.current);
      }
    };
  };

  // Dropdown moves to currently selected item
  useEffect(() => {
    if (listRef.current && highlightedIndex !== -1) {
      const currentItem = listRef.current.children[highlightedIndex];
      if (currentItem) {
        currentItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // console.log(isDropdownOpen, highlightedIndex, filteredCurrencies)

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen, filteredCurrencies, highlightedIndex]);

  const handleCurrencySelect = (currency: Currency) => {
    let selected: Currency[] = [];
    if (multiple) {
      const isSelected = selectedCurrencies.some(
        (c) => c.name === currency.name
      );
      const updatedSelection = isSelected
        ? selectedCurrencies.filter((c) => c.name !== currency.name)
        : [...selectedCurrencies, currency];
      selected = updatedSelection;
    } else {
      if (selectedCurrencies.includes(currency)) {
        selected = []; // Deselect
      } else {
        selected = [currency]; // Make selected the only one in array
      }
    }
    setSelectedCurrencies(selected);
    if (onChange) onChange(selected); // callback
  };
  
  // onBlur
  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  // onBlur
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="p-5 bg-blue-50">
      {label && (
        <h3 className="block flex align-left text-gray-700 mb-2 font-semibold">
          {label}
        </h3>
      )}
      <div className="relative mb-4">
        <div
          className={`flex w-50 items-center ${
            disabled ? "bg-gray-200" : "bg-gray-700"
          } border border-gray-300 rounded-md shadow-sm`}
        >
          <img
            src={SearchIcon}
            className="w-4 h-4 text-white ml-3 mr-3"
            aria-hidden="true"
          />
          <input
            id="searchField"
            type="text"
            value={inputText}
            onChange={(e) => onInputChange && onInputChange(e.target.value)}
            onClick={() => dropdownFunction()}
            disabled={disabled}
            className={`block w-full px-3 py-2 ${
              disabled ? "bg-slate-200" : "bg-slate-700"
            } text-gray-100 border-0 rounded-md shadow-sm focus:outline-none`}
            placeholder={disabled ? "" : placeholder}
          />
          {(isLoading || loading) && (
            <img className="w-10 h-10 ml-3 rounded-md" src={LoadingGif} />
          )}
        </div>
        {isDropdownOpen && filteredCurrencies.length > 0 && inputText != "" && (
          <div
            ref={refs.setFloating}
            style={{ position: strategy, top: y ?? "", left: x ?? "" }}
            className="absolute z-10 mt-11 w-full bg-blue-100 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            <div
              className="bg-blue-50 scrollbar dropdown-list"
              ref={listRef}
              onKeyUp={handleKeyDown}
              tabIndex={0}
            >
              {filteredCurrencies.map((currency, index) => (
                <div
                  key={currency.name}
                  className={`cursor-pointer px-4 py-2 text-black hover:bg-[#C7DEFD] flex flex-col items-start ${
                    index % 2 === 0 ? "bg-blue-50" : "bg-[#E5F0FF]"
                  } ${highlightedIndex === index ? "bg-[#C7DEFD]" : ""}`}
                  onClick={() => handleCurrencySelect(currency)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCurrencies.some(
                        (c) => c.name === currency.name
                      )}
                      onChange={() => handleCurrencySelect(currency)}
                      className="mr-4 custom-checkbox"
                      disabled={disabled}
                    />
                    {renderOption ? (
                      renderOption(currency)
                    ) : (
                      <span>{currency.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
};

export default CurrencyInput;
