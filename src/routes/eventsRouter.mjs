// src/routes/eventsRouter.mjs
import { Router } from "express";
import express from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createValidationSchema } from '../utils/validationSchema.mjs';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const eventsDataPath = path.join(__dirname, '..', 'constants', 'eventsData.json');


// GET all events
router.get('/api/events', async (req, res) => {
  try {
    const eventsData = await readFile(eventsDataPath, 'utf-8');
    res.json(JSON.parse(eventsData));
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET event by ID
router.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eventsData = await readFile(eventsDataPath, 'utf-8');
    const events = JSON.parse(eventsData);
    const event = events.find((event) => event.id === parseInt(id));
    if (!event) {
      return res.status(404).send('Event not found');
    }
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST new event
router.post(
  '/api/events',
  checkSchema(createValidationSchema), // Apply schema validation middleware
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { body } = req;
      const eventsData = await readFile(eventsDataPath, 'utf-8');
      const events = JSON.parse(eventsData);
      const newEvent = { id: events.length + 1, ...body };
      events.push(newEvent);
      await writeFile(eventsDataPath, JSON.stringify(events));
      res.status(201).json(newEvent);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
);

// PUT update event by ID
router.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const eventsData = await readFile(eventsDataPath, 'utf-8');
    const events = JSON.parse(eventsData);
    const eventIndex = events.findIndex((event) => event.id === parseInt(id));
    if (eventIndex === -1) {
      return res.status(404).send('Event not found');
    }
    events[eventIndex] = { id: parseInt(id), ...body };
    await writeFile(eventsDataPath, JSON.stringify(events));
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// PATCH partial update event by ID
router.patch('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const eventsData = await readFile(eventsDataPath, 'utf-8');
    const events = JSON.parse(eventsData);
    const eventIndex = events.findIndex((event) => event.id === parseInt(id));
    if (eventIndex === -1) {
      return res.status(404).send('Event not found');
    }
    events[eventIndex] = { ...events[eventIndex], ...body };
    await writeFile(eventsDataPath, JSON.stringify(events));
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE event by ID
router.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eventsData = await readFile(eventsDataPath, 'utf-8');
    let events = JSON.parse(eventsData);
    events = events.filter((event) => event.id !== parseInt(id));
    await writeFile(eventsDataPath, JSON.stringify(events));
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

export default router;
