import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import { useState, useRef } from 'react';
import { View, Text, TouchableHighlight, ScrollView } from 'react-native';
// TouchableOpacity vs TouchableHighlight
// Ref: https://github.com/GeekyAnts/NativeBase/issues/74#issuecomment-962456716

// Ref: https://stackoverflow.com/a/46829030

export default function App() {
  const [formula, setFormula] = useState("");
  const [formulaUp, setFormulaUp] = useState("");
  const scrollViewRefUp = useRef();
  const scrollViewRefDown = useRef();

  // Note:
  // inject [num] => "5" 
  // inject [operation] => " + ", " / ", " - ", etc

  const injectOperation = (keyOpt) => {
    // Asume each key operation only have one character (total 3 characters with white space)
    // Change operation
    if (formula === "" || (formula.slice(-1) === "." && formula.slice(-2, -1) === " ")) return;
    if (formula.slice(-1) === " ") return setFormula(`${formula.slice(0, -3)} ${keyOpt} `);
    return setFormula(`${formula} ${keyOpt} `);
  }

  const deleteHandler = (type) => {
    if (formula === "" && formulaUp === "") return;
    if (type === "ALL") {
      setFormulaUp("");
      setFormula("");
      return;
    };
    if (type === "LAST_ONE") {
      if (formula === "") {
        setFormula(formulaUp);
        setFormulaUp("");
        return;
      } else {
        if (formula === "Error") return setFormula("");
        return setFormula(formula.slice(0, -1));
      }
    }
  }

  const pointHandler = () => {
    const regex = /[0-9]*[.][0-9]*$/g;
    if (formula.slice(-1) === ")" || formula.slice(-1) === "." || formula.match(regex)) return;
    return setFormula(formula + ".");
  }

  const signHandler = () => {
    if (formula === "" || formula.slice(-1) === " " || (formula.slice(-1) === "." && formula.slice(-2, -1) === " ")) return;
    // Check if is already have bracket
    const regexIsAlreadyBracket = /\(-[0-9]*[.]?[0-9]*\)$/g;
    const numBracket = formula.match(regexIsAlreadyBracket);
    if (numBracket) return setFormula(
      formula.slice(0, -numBracket[0].length) + numBracket[0].slice(2, -1) // remove bracket
    );

    // if not already 
    // (case 1 positive, last)
    const regexGetLastNumber = /[0-9]*[.]?[0-9]*$/g;
    const numNoBracketPositive = formula.match(regexGetLastNumber);
    if (numNoBracketPositive) return setFormula(
      formula.slice(0, -numNoBracketPositive[0].length) + `(-${numNoBracketPositive[0]})`
    );
    // (case 2 negative, first)
    const regexGetFirstNumber = /^[-][0-9]*[.]?[0-9]/g;
    const numNoBracketNegative = formula.match(regexGetFirstNumber);
    if (numNoBracketNegative) return setFormula(
      formula.slice(0, -numNoBracketNegative[0].length) + numNoBracketNegative[0].slice(1) // remove negative sign
    );
  }

  const calculateFormula = () => {
    if (formula === "") return;
    try {
      const calcResult = eval(formula);
      const tempFormula = formula;
      setFormula(`${calcResult}`);
      return setFormulaUp(`${tempFormula}`);
    } catch (error) {
      setFormula("");
      return setFormulaUp("Error");
    }
  }

  const btnHandler = (key) => {
    if (typeof key === "number") {
      if (formula.slice(-1) === ")") return;
      if (formula === "" || formula === "0") return setFormula(`${key}`);
      return setFormula(`${formula}${key}`);
    }

    switch (key) {
      case "POINT":
        return pointHandler();

      case "DEL_ALL":
        return deleteHandler("ALL");

      case "DEL_LAST":
        return deleteHandler("LAST_ONE");

      case "CHANGE_SIGN":
        return signHandler();

      case "DIVISOR":
        return injectOperation("/");

      case "TIMES":
        return injectOperation("*");

      case "MINUS":
        return injectOperation("-");

      case "PLUS":
        return injectOperation("+");

      case "CALCULATE":
        return calculateFormula();

      default:
        break;
    }
  }

  const renderFormula = (f) => {
    // replace "*"
    f = f.replace(/\*/g, "×");
    f = f.replace(/\//g, "÷");
    return f;
  }

  return (
    <View style={tw`bg-gray-800 flex-1 flex-col justify-center items-center`}>
      <StatusBar style="light" />
      <View style={tw`flex-col justify-end bg-gray-900 h-5/12 w-full max-w-lg`}>
        <View style={tw`flex-row justify-end bg-gray-900 w-full mb-2`}>
          <View style={tw`flex-1`} />
          <View>
            <ScrollView
              ref={scrollViewRefUp}
              onContentSizeChange={() => scrollViewRefUp.current.scrollToEnd({ animated: true })}
              horizontal={true}
            >
              <Text style={tw`text-white text-3xl`}>{renderFormula(formulaUp)}</Text>
            </ScrollView>
          </View>
        </View>
        <View style={tw`flex-row justify-end text-right bg-gray-900 w-full mb-4`}>
          <View style={tw`flex-1`} />
          <View>
            <ScrollView
              ref={scrollViewRefDown}
              onContentSizeChange={() => scrollViewRefDown.current.scrollToEnd({ animated: true })}
              horizontal={true}
            >
              <Text style={tw`text-white text-7xl`}>{renderFormula(formula)}</Text>
            </ScrollView>
          </View>
        </View>
      </View>
      <View style={tw.style(`flex-col bg-blue-200 h-7/12 w-full max-w-lg`)}>
        <View style={tw`flex-row bg-yellow-200 w-full h-1/5`}>
          {/* Delete all */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler("DEL_ALL")}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-gray-500`}>
            <Text style={tw.style(`text-2xl text-yellow-500`)}>AC</Text>
          </TouchableHighlight>
          {/* Delete last one */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler("DEL_LAST")}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-yellow-500`)}>⌫</Text>
          </TouchableHighlight>
          {/* Plus or minus */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler("CHANGE_SIGN")}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-600`)}>+/-</Text>
          </TouchableHighlight>
          {/* Divisor */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler("DIVISOR")}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-r-0 border-gray-500`}>
            <Text style={tw.style(`text-4xl text-gray-600`)}>÷</Text>
          </TouchableHighlight>
        </View>
        <View style={tw`flex-row bg-yellow-200 w-full h-1/5`}>
          {/* Number 7 */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler(7)}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-700`)}>7</Text>
          </TouchableHighlight>
          {/* Number 8 */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler(8)}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-700`)}>8</Text>
          </TouchableHighlight>
          {/* Number 9 */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler(9)}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-700`)}>9</Text>
          </TouchableHighlight>
          {/* Times */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler("TIMES")}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-r-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-600`)}>×</Text>
          </TouchableHighlight>
        </View>
        <View style={tw`flex-row bg-yellow-200 w-full h-1/5`}>
          {/* Number 4 */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler(4)}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-700`)}>4</Text>
          </TouchableHighlight>
          {/* Number 5 */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler(5)}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-700`)}>5</Text>
          </TouchableHighlight>
          {/* Number 6 */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler(6)}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-700`)}>6</Text>
          </TouchableHighlight>
          {/* Number - */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler("MINUS")}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-r-0 border-gray-500`}>
            <Text style={tw.style(`text-4xl text-gray-600`)}>-</Text>
          </TouchableHighlight>
        </View>
        <View style={tw`flex-row bg-yellow-200 w-full h-1/5`}>
          {/* Number 1 */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler(1)}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-700`)}>1</Text>
          </TouchableHighlight>
          {/* Number 2 */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler(2)}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-700`)}>2</Text>
          </TouchableHighlight>
          {/* Number 3 */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler(3)}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-700`)}>3</Text>
          </TouchableHighlight>
          {/* Number 8 */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler("PLUS")}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-r-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-600`)}>+</Text>
          </TouchableHighlight>
        </View>
        <View style={tw`flex-row bg-gray-300 w-full h-1/5`}>
          {/* Number 0 */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler(0)}
            style={tw`bg-gray-200 h-full w-1/2 flex-row justify-center items-center border border-l-0 border-t-0 border-b-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-700`)}>0</Text>
          </TouchableHighlight>
          {/* Point or Dot */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#9CA3AF"
            onPress={() => btnHandler("POINT")}
            style={tw`bg-gray-200 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-b-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-gray-700`)}>•</Text>
          </TouchableHighlight>
          {/* Calculate "=" */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#D97706"
            onPress={() => btnHandler("CALCULATE")}
            style={tw`bg-yellow-500 h-full w-1/4 flex-row justify-center items-center border border-l-0 border-t-0 border-r-0 border-b-0 border-gray-500`}>
            <Text style={tw.style(`text-3xl text-white`)}>=</Text>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}