import React, { useState, useEffect } from 'react';

const ChildSupportCalculator = () => {
  const [parent1, setParent1] = useState({ name: 'Parent 1', income: 150000, additionalChildren: 0, applicableIncome: 0, calculation: '' });
  const [parent2, setParent2] = useState({ name: 'Parent 2', income: 80000, additionalChildren: 0, applicableIncome: 0, calculation: '' });
  const [childOver13, setChildOver13] = useState(false);
  const [custodyPercentage, setCustodyPercentage] = useState(50); // Default to 50% for Parent 1
  const [result, setResult] = useState(null);

  const selfSupportAmount = 28463;

  const calculateChildCost = (income, numberOfChildren, isOver13) => {
    if (numberOfChildren === 0) return 0;
    const incomeBracketsUnder13 = [
      { max: 42695, rates: [0.17, 0.24, 0.27] },
      { max: 85389, rates: [0.15, 0.23, 0.26], base: [7258, 10247, 11528] },
      { max: 128084, rates: [0.12, 0.20, 0.25], base: [13662, 20067, 22628] },
      { max: 170778, rates: [0.10, 0.18, 0.24], base: [18785, 28606, 33302] },
      { max: 213473, rates: [0.07, 0.10, 0.18], base: [23054, 36291, 43549] },
      { max: Infinity, rates: [0, 0, 0], base: [26043, 40561, 51234] }
    ];
    const incomeBracketsOver13 = [
      { max: 42695, rates: [0.23, 0.29, 0.32] },
      { max: 85389, rates: [0.22, 0.28, 0.31], base: [9820, 12382, 13662] },
      { max: 128084, rates: [0.12, 0.25, 0.30], base: [19213, 24336, 26897] },
      { max: 170778, rates: [0.10, 0.20, 0.29], base: [24336, 35010, 39706] },
      { max: 213473, rates: [0.09, 0.13, 0.20], base: [28605, 43549, 52087] },
      { max: Infinity, rates: [0, 0, 0], base: [32448, 49099, 60626] }
    ];

    const incomeBrackets = isOver13 ? incomeBracketsOver13 : incomeBracketsUnder13;
    const bracket = incomeBrackets.find(b => income <= b.max);
    const index = Math.min(numberOfChildren - 1, 2);

    if (bracket.base) {
      const baseAmount = bracket.base[index];
      const additionalAmount = Math.max(0, income - incomeBrackets[incomeBrackets.indexOf(bracket) - 1].max);
      return Math.round(baseAmount + additionalAmount * bracket.rates[index]);
    } else {
      return Math.round(income * bracket.rates[index]);
    }
  };

  const calculateApplicableIncome = (income, additionalChildren, isOver13) => {
    const baseIncome = Math.max(0, income - selfSupportAmount);
    const deduction = calculateChildCost(baseIncome, additionalChildren, isOver13);
    const applicableIncome = Math.max(0, baseIncome - deduction);
    const calculation = `$${Math.round(income)} - $${selfSupportAmount} - $${Math.round(deduction)}`;
    return { applicableIncome: Math.round(applicableIncome), calculation };
  };

  useEffect(() => {
    const updateParent = (parent, setParent) => {
      const { applicableIncome, calculation } = calculateApplicableIncome(parent.income, parent.additionalChildren, childOver13);
      setParent(prev => ({ ...prev, applicableIncome, calculation }));
    };


    updateParent(parent1, setParent1);
    updateParent(parent2, setParent2);

    const totalChildSupportIncome = parent1.applicableIncome + parent2.applicableIncome;
    const childCost = calculateChildCost(totalChildSupportIncome, 1, childOver13); // Assuming 1 shared child

    const parent1IncomePercentage = parent1.applicableIncome / totalChildSupportIncome;
    const parent2IncomePercentage = parent2.applicableIncome / totalChildSupportIncome;

    const parent1CareCost = custodyPercentage / 100;
    const parent2CareCost = 1 - parent1CareCost;

    const parent1Difference = parent1IncomePercentage - parent1CareCost;
    const parent2Difference = parent2IncomePercentage - parent2CareCost;

    let owingParent, owedAmount, childSupportPercentage;
    if (parent1Difference > 0) {
      owingParent = parent1.name;
      owedAmount = Math.round(parent1Difference * childCost);
      childSupportPercentage = parent1Difference * 100;
    } else if (parent2Difference > 0) {
      owingParent = parent2.name;
      owedAmount = Math.round(parent2Difference * childCost);
      childSupportPercentage = parent2Difference * 100;
    } else {
      owingParent = "Neither";
      owedAmount = 0;
      childSupportPercentage = 0;
    }

    const totalIncome = parent1.income + parent2.income;

    const weeklyAmount = Math.round(owedAmount / 52);
    const fortnightlyAmount = Math.round(owedAmount / 26);
    const monthlyAmount = Math.round(owedAmount / 12);

    setResult({
      owingParent,
      owedAmount,
      childCost: Math.round(childCost),
      totalIncome,
      totalChildSupportIncome,
      childSupportPercentage: childSupportPercentage.toFixed(2),
      weeklyAmount,
      fortnightlyAmount,
      monthlyAmount
    });
  }, [parent1, parent2, childOver13, custodyPercentage, calculateApplicableIncome]);

  const updateParent = (parentNumber, field, value) => {
    const setParent = parentNumber === 1 ? setParent1 : setParent2;
    setParent(prev => ({ ...prev, [field]: value }));
  };

  const ParentInput = ({ parentNum, parent, updateParent }) => (
    <div style={{ marginBottom: '20px' }}>
      <div>
        <label htmlFor={`name-${parentNum}`}>Name:</label>
        <input
          type="text"
          id={`name-${parentNum}`}
          value={parent.name}
          onChange={(e) => updateParent(parentNum, 'name', e.target.value)}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        />
      </div>
      <div>
        <label htmlFor={`income-${parentNum}`}>Income: ${parent.income}</label>
        <input
          type="range"
          id={`income-${parentNum}`}
          min="0"
          max="250000"
          step="5000"
          value={parent.income}
          onChange={(e) => updateParent(parentNum, 'income', Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      <div>
        <label htmlFor={`additional-children-${parentNum}`}>Additional Children: {parent.additionalChildren}</label>
        <input
          type="range"
          id={`additional-children-${parentNum}`}
          min="0"
          max="5"
          step="1"
          value={parent.additionalChildren}
          onChange={(e) => updateParent(parentNum, 'additionalChildren', Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      <div>Applicable Income: ${parent.applicableIncome}</div>
      <div>Calculation: {parent.calculation}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Child Support Calculator</h2>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="custody-slider">Custody Split: {custodyPercentage}% / {100 - custodyPercentage}%</label>
        <input
          type="range"
          id="custody-slider"
          min="0"
          max="100"
          step="1"
          value={custodyPercentage}
          onChange={(e) => setCustodyPercentage(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div>{parent1.name}: {custodyPercentage}% | {parent2.name}: {100 - custodyPercentage}%</div>
      </div>
      <ParentInput parentNum={1} parent={parent1} updateParent={updateParent} />
      <ParentInput parentNum={2} parent={parent2} updateParent={updateParent} />
      <div>
        <label>
          <input
            type="checkbox"
            checked={childOver13}
            onChange={(e) => setChildOver13(e.target.checked)}
          />
          Child is 13 or over
        </label>
      </div>
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>Result:</h3>
          <p>Total Income: ${result.totalIncome}</p>
          <p>Total Child Support Income: ${result.totalChildSupportIncome}</p>
          <p>Cost of the child: ${result.childCost}</p>
          <p>Child support percentage: {result.childSupportPercentage}%</p>
          <p>Estimated amount payable: ${result.owedAmount} per year payable by: {result.owingParent}</p>
          <p>Total payable by {result.owingParent}: ${result.owedAmount}</p>
          <h4>The estimated annual rate per year can be broken down further as:</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '5px' }}>Estimated amount: week</th>
                <th style={{ border: '1px solid black', padding: '5px' }}>Estimated amount: fortnight</th>
                <th style={{ border: '1px solid black', padding: '5px' }}>Estimated amount: month</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '5px' }}>${result.weeklyAmount}</td>
                <td style={{ border: '1px solid black', padding: '5px' }}>${result.fortnightlyAmount}</td>
                <td style={{ border: '1px solid black', padding: '5px' }}>${result.monthlyAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ChildSupportCalculator;