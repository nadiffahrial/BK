import { getDb } from '../config/db.js';
import { state } from '../store.js';

export const getAllBuildings = async (req, res) => {
  const db = getDb();
  if (db) {
    try {
      const [buildings] = await db.query('SELECT * FROM `buildings`');
      const [floors] = await db.query('SELECT * FROM `floors` ORDER BY `floor_number` ASC');
      const [rooms] = await db.query('SELECT * FROM `rooms`');
      const [facilities] = await db.query('SELECT * FROM `room_facilities`');
      const [schedules] = await db.query('SELECT * FROM `room_schedules`');

      // Reconstruct nested structure
      const fullBuildings = buildings.map(b => {
        const bFloors = floors.filter(f => f.building_id === b.id).map(f => {
          const fRooms = rooms.filter(r => r.building_id === b.id && r.floor_number === f.floor_number).map(r => {
            const rFacilities = facilities.filter(fac => fac.room_id === r.id).map(fac => ({
              name: fac.name,
              iconName: fac.icon_name,
              available: Boolean(fac.available),
              spec: fac.spec
            }));
            const rSchedule = schedules.filter(s => s.room_id === r.id).map(s => ({
              id: s.id,
              title: s.title,
              organizer: s.organizer,
              timeRange: s.time_range,
              type: s.type
            }));

            return {
              id: r.id,
              code: r.code,
              name: r.name,
              buildingId: r.building_id,
              floorNumber: r.floor_number,
              type: r.type,
              status: r.status,
              capacity: r.capacity,
              currentOccupancy: r.current_occupancy,
              temperature: r.temperature,
              acUnits: r.ac_units,
              description: r.description,
              currentActivity: r.current_activity_json ? (typeof r.current_activity_json === 'string' ? JSON.parse(r.current_activity_json) : r.current_activity_json) : null,
              coordinates: typeof r.coordinates_json === 'string' ? JSON.parse(r.coordinates_json) : r.coordinates_json,
              facilities: rFacilities,
              schedule: rSchedule
            };
          });

          return {
            floorNumber: f.floor_number,
            name: f.name,
            description: f.description,
            dimensions: { width: f.width, height: f.height },
            rooms: fRooms
          };
        });

        return {
          id: b.id,
          code: b.code,
          name: b.name,
          shortName: b.short_name,
          tagline: b.tagline,
          floorsCount: b.floors_count,
          address: b.address,
          operatingHours: b.operating_hours,
          floors: bFloors
        };
      });

      return res.status(200).json({
        success: true,
        source: 'MySQL (XAMPP)',
        count: fullBuildings.length,
        data: fullBuildings
      });
    } catch (err) {
      console.error('MySQL query error in getAllBuildings:', err);
    }
  }

  // Fallback to in-memory state
  res.status(200).json({
    success: true,
    source: 'in-memory-fallback',
    count: state.buildings.length,
    data: state.buildings
  });
};

export const getBuildingById = async (req, res) => {
  const { id } = req.params;
  const db = getDb();

  if (db) {
    try {
      const [buildings] = await db.query('SELECT * FROM `buildings` WHERE id = ? OR code = ?', [id, id]);
      if (buildings.length > 0) {
        return res.status(200).json({
          success: true,
          source: 'MySQL (XAMPP)',
          data: buildings[0]
        });
      }
    } catch (err) {
      console.error('MySQL query error in getBuildingById:', err);
    }
  }

  const building = state.buildings.find(b => b.id.toLowerCase() === id.toLowerCase() || b.code.toLowerCase() === id.toLowerCase());
  if (!building) {
    return res.status(404).json({ success: false, message: `Gedung '${id}' tidak ditemukan` });
  }

  res.status(200).json({ success: true, data: building });
};

export const getBuildingFloors = async (req, res) => {
  const { id } = req.params;
  const db = getDb();

  if (db) {
    try {
      const [floors] = await db.query('SELECT * FROM `floors` WHERE building_id = ? ORDER BY floor_number ASC', [id]);
      if (floors.length > 0) {
        return res.status(200).json({
          success: true,
          source: 'MySQL (XAMPP)',
          data: floors
        });
      }
    } catch (err) {
      console.error('MySQL query error in getBuildingFloors:', err);
    }
  }

  const building = state.buildings.find(b => b.id.toLowerCase() === id.toLowerCase() || b.code.toLowerCase() === id.toLowerCase());
  if (!building) {
    return res.status(404).json({ success: false, message: `Gedung '${id}' tidak ditemukan` });
  }

  res.status(200).json({ success: true, data: building.floors });
};
