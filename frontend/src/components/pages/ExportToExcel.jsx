import  { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import axios from 'axios';

const ExportToExcel = ({ surveyId }) => {
  const [surveyData, setSurveyData] = useState(null);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/surveyData/${surveyId}`);
        setSurveyData(response.data);
      } catch (error) {
        console.error('Error fetching survey data:', error);
      }
    };

    fetchSurveyData();
  }, [surveyId]);

  const exportToExcel = () => {
    if (!surveyData || !surveyData.questions) return;

    // Transform the data to the required format
    const data = surveyData.questions.map(question => {
      return question.answers.map(answer => ({
        its_id: answer.its_id,
        Question: question.label,
        Answer: answer.text
      }));
    }).flat();

    // Create a new workbook and a new worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Survey Data");

    // Write the workbook to a file
    XLSX.writeFile(wb, "SurveyData.xlsx");
  };

  return (
    <button onClick={exportToExcel} className="export-btn">
      Export to Excel
    </button>
  );
};

// Define prop types
ExportToExcel.propTypes = {
  surveyId: PropTypes.string.isRequired
};

export default ExportToExcel;
