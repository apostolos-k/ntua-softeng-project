import React, { Component } from 'react';
import { CSVLink } from "react-csv";
import "./Home.css";

const headers = [
  { label: "Question", key: "questionID" },
  { label: "Answer", key: "ans" }
];

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questionnaireId: '',
      data: [],
      error: null
    }
    this.csvLinkEl = React.createRef();
  }

  getUserList = async () => {
    const response = await fetch(`https://localhost:9103/intelliq_api/exportanswers/${this.state.questionnaireId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Questionnaire not found');
      } else {
        throw new Error('Failed to fetch data');
      }
    }
    return response.json();
  }

  downloadCSV = async () => {
    try {
      const data = await this.getUserList();
      this.setState({ data: data, error: null }, () => {
        setTimeout(() => {
          this.csvLinkEl.current.link.click();
        });
      });
    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  downloadJSON = async () => {
    try {
      const data = await this.getUserList();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Answers.json');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  render() {
    const { data, questionnaireId, error } = this.state;

    return (
      <div className="container">
        <div className="title">Search questionnaire</div>

        <input
          type="text"
          value={questionnaireId}
          onChange={e => this.setState({ questionnaireId: e.target.value })}
          className="input"
        />
        <div>
          <button onClick={this.downloadCSV}>Export to CSV</button>
          <CSVLink
            headers={headers}
            filename="Answers.csv"
            data={data}
            ref={this.csvLinkEl}
          />
          <button onClick={this.downloadJSON}>Export to JSON</button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>
    );
  }
}

export default Home;