const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema(
  {
    assigned_to: {
      type: String,
      required: false,
      default: '',
    },
    status_text: {
      type: String,
      required: false,
      default: '',
    },
    open: {
      type: Boolean,
      required: false,
      default: false,
    },
    _id: {
      type: String,
      required: true,
    },
    issue_title: {
      type: String,
      required: true,
    },
    issue_text: {
      type: String,
      required: true,
    },
    created_by: {
      type: String,
      required: true,
    },
    created_on: {
      type: String,
      required: false,
    },
    updated_on: {
      type: String,
      required: false,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = IssueSchema;
