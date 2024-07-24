import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import axios from 'axios';

const ExportToExcel = ({ surveyId, surveyTitle }) => {
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
    const headers = ['itsid', ...surveyData.questions.map(question => question.label)];
    const rows = [];
  
    // Create a mapping of itsid to answers for each question
    const itsidToAnswers = {};
    surveyData.questions.forEach((question) => {
      question.answers.forEach((answer) => {
        if (!itsidToAnswers[answer.itsid]) {
          itsidToAnswers[answer.itsid] = {};
        }
        itsidToAnswers[answer.itsid][question.label] = answer.text || '';
      });
    });
  
    // Create rows using the mapping
    Object.keys(itsidToAnswers).forEach((itsid) => {
      const row = { itsid };
      headers.slice(1).forEach((header) => {
        row[header] = itsidToAnswers[itsid][header] || '';
      });
      rows.push(row);
    });
  
    // Create a new workbook and a new worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
  
    // Add the headers and rows to the worksheet
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });
    XLSX.utils.sheet_add_json(ws, rows, { origin: "A2", skipHeader: true });
  
    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Survey Data");
  
    // Write the workbook to a file
    XLSX.writeFile(wb, `${surveyTitle}.xlsx`);
  };
  

  return (
    <button onClick={exportToExcel} className="export-btn">
      Export to Excel
    </button>
  );
};

// Define prop types
ExportToExcel.propTypes = {
  surveyId: PropTypes.string.isRequired,
  surveyTitle: PropTypes.string.isRequired
};

export default ExportToExcel;
