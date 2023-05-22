const fs = require('fs')
const patientDataFilePath = './patient-data.json'
const express = require('express')
const app = express()
const PORT = process.env.PORT || 4001

const searchForPatient = (query, data) => {
    let searchResultsArray = data
    let searchKeyArray = Object.keys(query)
    let searchValueArray = Object.values(query)
    for (let i = 0; i < searchKeyArray.length; i++) {
        searchResultsArray = searchResultsArray.filter(object => object[searchKeyArray[i]] == searchValueArray[i])
    }
    switch(searchResultsArray.length) {
        case 0:
            return null
        case 1:
            return searchResultsArray[0]
        default:
            return searchResultsArray
    }
}

const api = {
    log: function(request, method) {
        console.log(method)
        console.log(request)
    }
}

const getPatientData = (filePath) => {
    const jsonData = fs.readFileSync(filePath)
    return JSON.parse(jsonData)
}

const savePatientData = (data, filePath) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync(filePath, stringifyData)
}

const generatePrimaryKey = (data) => {
    let highestNumber = 0
    data.forEach(patient => {
        if (patient['primaryKey'] > highestNumber) {
            highestNumber = patient['primaryKey']
        }
    })
    return highestNumber + 1
}

const generateNewPatientData = (newData, primaryKey, originalData={}) => {
    return {
        primaryKey: primaryKey,
        lastName: newData['lastName'] ? newData['lastName']: originalData.lastName,
        firstName: newData['firstName'] ? newData['firstName']: originalData.firstName,
        dob: newData['dob'] ? newData['dob'] : originalData.dob,
        nurseUnit: newData['nurseUnit'] ?  newData['nurseUnit'] : originalData.nurseUnit,
        room: newData['room'] ? newData['room'] : originalData.room,
        bed: newData['bed'] ? newData['bed'] : originalData.bed,
        roomExt: newData['roomExt'] ? newData['roomExt'] : originalData.roomExt,
        nurseExt: newData['nurseExt'] ? newData['nurseExt'] : originalData.nurseExt,
        mrn: newData['mrn'] ? newData['mrn'] : originalData.mrn,
        facility: newData['facility'] ? newData['facility'] : originalFData.facility,
        admitDate: newData['admitDate'] ? newData['admitDate'] : originalData.admitDate,
        dischargeDate: newData['dischargeDate'] ? newData['dischargeDate'] : originalData.dischargeDate,
        deceased: newData['deceased'] ? newData['deceased'] : originalData.deceased,
        privacy: newData['privacy'] ? newData['privacy'] : originalData.privacy,
        sex: newData['sex'] ? newData['sex'] : originalData.sex
      } 
}

app.get('/api', (req, res, next) => {
    api.log(req.query, req.method)
    res.send(`Current Version: v1.0.0-alpha`)
})

app.get('/api/v1.0.0-alpha/patients', (req, res, next) => {
    api.log(req.query, req.method)
    let currentData = getPatientData(patientDataFilePath)
    let patientFound = searchForPatient(req.query, currentData)
    if (patientFound) {
        res.status(200).send(patientFound)
    }
    else {
        res.status(404).send("Patient not found")
    }
})

app.post('/api/v1.0.0-alpha/patients', (req, res, next) => {
    api.log(req.query, req.method)
    let currentData = getPatientData(patientDataFilePath)
    let newPrimaryKey = generatePrimaryKey(currentData)
    const newPatientData = generateNewPatientData(req.query, newPrimaryKey)
    currentData.push(newPatientData)
    savePatientData(currentData, patientDataFilePath)
    res.status(201).send("Patient created")
})

app.put('/api/v1.0.0-alpha/patients', (req, res, next) => {
    api.log(req.query, req.method)
    if (!req.query.primaryKey) {
        res.status(400).send("Bad Request. Primary Key Required.")
        return null
    }
    let currentData = getPatientData(patientDataFilePath)
    let patientFound = searchForPatient({primaryKey: req.query.primaryKey}, currentData)
    let patientIndex = currentData.indexOf(patientFound)
    if (!patientFound) {
        res.status(404).send("Patient not found")
        return null
    }
    if (typeof patientFound == 'array') {
        res.status(300).send("Multiple patients found")
        return null
    }
    const updatedPatientData = generateNewPatientData(req.query, req.query.primaryKey, patientFound)
    currentData.splice(patientIndex, 1, updatedPatientData)
    savePatientData(currentData, patientDataFilePath)
    res.status(200).send("Patient updated")
})

app.delete('/api/v1.0.0-alpha/patients', (req, res, next) => {
    api.log(req.query, req.method)
    if (!req.query.primaryKey) {
        res.status(400).send("Bad Request. Primary Key Required.")
        return null
    }
    let currentData = getPatientData(patientDataFilePath)
    let patientFound = searchForPatient({primaryKey: req.query.primaryKey}, currentData)
    if (!patientFound) {
        res.status(404).send("Patient not found")
    }
    else {
        let patientIndex = currentData.indexOf(patientFound)
        currentData.splice(patientIndex, 1)
        savePatientData(currentData, patientDataFilePath)
        res.status(200).send("Patient deleted")
    }
})

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
