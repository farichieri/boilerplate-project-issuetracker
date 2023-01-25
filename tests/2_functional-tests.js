const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let postExample = {
  issue_title: 'Test Title',
  issue_text: 'Test Text',
  created_by: 'Test Create',
  assigned_to: 'Test Assigned To',
  status_text: 'Test Status',
};

suite('Functional Tests', function () {
  test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .post('/api/issues/testing')
      .send(postExample)
      .end((err, res) => {
        assert.equal(Boolean(res.body._id), true);
        assert.equal(res.body.open, true);
        assert.equal(res.status, 200);
      });
    done();
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .post('/api/issues/testing')
      .send({
        issue_title: 'Test Title',
        issue_text: 'Test Text',
        created_by: 'Test Create',
      })
      .end((err, res) => {
        assert.equal(Boolean(res.body._id), true);
        assert.equal(res.body.open, true);
        assert.equal(res.status, 200);
      });
    done();
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .post('/api/issues/testing')
      .send({
        assigned_to: 'Test Assigned To',
        status_text: 'Test Status',
      })
      .end((err, res) => {
        assert.equal(res.body.error, 'required field(s) missing');
        assert.equal(res.status, 200);
      });
    done();
  });

  test('View issues on a project: GET request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .get('/api/issues/testing')
      .end((err, res) => {
        assert.typeOf(res.body, 'array');
        assert.equal(res.status, 200);
      });
    done();
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
    const url = '/api/issues/testing?open=true';
    const queryParams = '?' + url.split('?')[1];

    chai
      .request(server)
      .get(url)
      .end((err, res) => {
        const queries = new URLSearchParams(queryParams);
        const issues = res.body;
        let filtered = issues;

        if (Object.keys(queries).length > 0) {
          for (let key in queries) {
            filtered = filtered.filter((d) => {
              return String(d[key]) === String(queries[key]);
            });
          }
        }
        assert.typeOf(res.body, 'array');
        assert.equal(res.body, filtered);
        assert.equal(res.status, 200);
      });
    done();
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
    const url = '/api/issues/testing?open=true&issue_title=test';
    const queryParams = '?' + url.split('?')[1];

    chai
      .request(server)
      .get(url)
      .end((err, res) => {
        const queries = new URLSearchParams(queryParams);
        const issues = res.body;
        let filtered = issues;

        if (Object.keys(queries).length > 0) {
          for (let key in queries) {
            filtered = filtered.filter((d) => {
              return String(d[key]) === String(queries[key]);
            });
          }
        }
        assert.typeOf(res.body, 'array');
        assert.equal(res.body, filtered);
        assert.equal(res.status, 200);
      });
    done();
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
    const url = '/api/issues/testing';

    chai
      .request(server)
      .post(url)
      .send(postExample)
      .end((err, res) => {
        const _id = res.body._id;

        chai
          .request(server)
          .put(url)
          .send({
            _id: _id,
            issue_title: 'Updated Title',
          })
          .end((err, res) => {
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, _id);
            assert.equal(res.status, 200);
          });
        done();
      });
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', (done) => {
    const url = '/api/issues/testing';

    chai
      .request(server)
      .post(url)
      .send(postExample)
      .end((err, res) => {
        const _id = res.body._id;

        chai
          .request(server)
          .put(url)
          .send({
            _id: _id,
            issue_title: 'Updated Title',
            assigned_to: 'Updated Assignment',
          })
          .end((err, res) => {
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, _id);
            assert.equal(res.status, 200);
          });
        done();
      });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
    const url = '/api/issues/testing';

    chai
      .request(server)
      .post(url)
      .send(postExample)
      .end((err, res) => {
        chai
          .request(server)
          .put(url)
          .send({
            issue_title: 'Updated Title',
            assigned_to: 'Updated Assignment',
          })
          .end((err, res) => {
            assert.equal(res.body.error, 'missing _id');
            assert.equal(res.status, 200);
          });
        done();
      });
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
    const url = '/api/issues/testing';

    chai
      .request(server)
      .post(url)
      .send(postExample)
      .end((err, res) => {
        const _id = res.body._id;

        chai
          .request(server)
          .put(url)
          .send({
            _id: _id,
          })
          .end((err, res) => {
            assert.equal(res.body.error, 'no update field(s) sent');
            assert.equal(res.body._id, _id);
            assert.equal(res.status, 200);
          });
        done();
      });
  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
    const url = '/api/issues/testing';

    chai
      .request(server)
      .post(url)
      .send(postExample)
      .end((err, res) => {
        const _id = 'invalid_id';

        chai
          .request(server)
          .put(url)
          .send({
            _id: _id,
            issue_title: 'Updated Title',
          })
          .end((err, res) => {
            assert.equal(res.body.error, 'could not update');
            assert.equal(res.body._id, _id);
            assert.equal(res.status, 200);
          });
        done();
      });
  });

  test('Delete an issue: DELETE request to /api/issues/{project}', (done) => {
    const url = '/api/issues/testing';

    chai
      .request(server)
      .post(url)
      .send(postExample)
      .end((err, res) => {
        const _id = res.body._id;

        chai
          .request(server)
          .delete(url)
          .send({
            _id: _id,
          })
          .end((err, res) => {
            assert.equal(res.body.result, 'successfully deleted');
            assert.equal(res.status, 200);
          });
        done();
      });
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', (done) => {
    const url = '/api/issues/testing';

    chai
      .request(server)
      .post(url)
      .send(postExample)
      .end((err, res) => {
        const _id = 'invalid_id_2';

        chai
          .request(server)
          .delete(url)
          .send({
            _id: _id,
          })
          .end((err, res) => {
            assert.equal(res.body.error, 'could not delete');
            assert.equal(res.body._id, _id);
            assert.equal(res.status, 200);
          });
        done();
      });
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', (done) => {
    const url = '/api/issues/testing';

    chai
      .request(server)
      .post(url)
      .send(postExample)
      .end((err, res) => {
        chai
          .request(server)
          .delete(url)
          .send({})
          .end((err, res) => {
            assert.equal(res.body.error, 'missing _id');
            assert.equal(res.status, 200);
          });
        done();
      });
  });
});
