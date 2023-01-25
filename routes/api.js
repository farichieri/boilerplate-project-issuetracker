'use strict';

const IssueSchema = require('../models/issue');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(function (req, res) {
      const { project } = req.params;
      const queries = req.query;
      const collection = project ? project : 'apitest';
      const Schema = mongoose.model('Issue', IssueSchema, collection);

      Schema.find()
        .then((doc) => {
          let filtered = doc;
          if (Object.keys(queries).length > 0) {
            for (let key in queries) {
              filtered = filtered.filter((d) => {
                return String(d[key]) === String(queries[key]);
              });
            }
          }
          res.status(200).json(filtered);
        })
        .catch((e) => res.status(400).json({ error: 'Error finding issues' }));
    })

    .post(async (req, res) => {
      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      if (!issue_title || !issue_text || !created_by) {
        res.status(200).send({ error: 'required field(s) missing' });
      }

      const { project } = req.params;
      const collection = project ? project : 'apitest';

      const Schema = mongoose.model('Issue', IssueSchema, collection);

      const newIssue = new Schema({
        assigned_to,
        status_text,
        open: true,
        _id: new ObjectId(),
        issue_title,
        issue_text,
        created_by,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
      });

      newIssue
        .save()
        .then((doc) => {
          res.status(200).send(doc);
        })
        .catch((e) => {
          res.status(400).json({ error: 'Error posting issue' });
        });
    })

    .put((req, res) => {
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;
      const { project } = req.params;
      const collection = project ? project : 'apitest';
      const Schema = mongoose.model('Issue', IssueSchema, collection);

      if (!_id) {
        res.status(200).send({ error: 'missing _id' });
      }

      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text
      ) {
        res.status(200).send({ error: 'no update field(s) sent', _id: _id });
      }

      Schema.findById({
        _id: _id,
      })
        .then((doc) => {
          doc.issue_title = issue_title || doc.issue_title;
          doc.issue_text = issue_text || doc.issue_text;
          doc.created_by = created_by || doc.created_by;
          doc.assigned_to = assigned_to || doc.assigned_to;
          doc.status_text = status_text || doc.status_;
          doc.open = open || doc.open;
          doc.updated_on = new Date().toISOString();

          doc.save().then((docUpdated) => {
            res.status(200).send({
              result: 'successfully updated',
              _id: docUpdated._id,
            });
          });
        })
        .catch((err) => {
          res.status(200).send({ error: 'could not update', _id: _id });
        });
    })

    .delete((req, res) => {
      const { _id } = req.body;
      const { project } = req.params;
      const collection = project ? project : 'apitest';
      const Schema = mongoose.model('Issue', IssueSchema, collection);

      if (!_id) {
        res.status(200).send({ error: 'missing _id' });
      }

      Schema.findById({
        _id: _id,
      })
        .then((doc) => {
          doc.remove().then((docRemoved) => {
            res.status(200).send({ result: 'successfully deleted', _id: _id });
          });
        })
        .catch((err) =>
          res.status(200).send({ error: 'could not delete', _id: _id })
        );
    });

  // 404 Not Found Middleware
  app.use(function (req, res, next) {
    res.status(404).type('text').send('Not Found');
  });
};
