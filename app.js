const { MongoClient } = require('mongodb');

// Замените эту строку на вашу строку подключения к локальной MongoDB
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);

async function main() {
    try {
        await client.connect();
        const database = client.db('task4');
        const collection = database.collection('task');

        // Создание индекса
        await collection.createIndex({ Country: 1 });

        // Пример запроса с explain
        const explainResult = await collection.find({ Country: "Russia" }).explain("executionStats");
        console.log("Explain result:", explainResult);

        // Пример агрегационного запроса
        const aggregationResult = await collection.aggregate([
            {
                $group: {
                    _id: "$Country",
                    averageTemperatureChange: { $avg: "$F2022" } // Замените "F2022" на актуальное название поля, если оно отличается
                }
            }
        ]).toArray();
        console.log("Aggregation result:", aggregationResult);

        // Запрос без агрегации
        console.time('findQuery');
        const countries = await collection.find({}, { projection: { _id: 0, Country: 1, F2022: 1 } }).toArray();
        const averageTemperatureChange = countries.reduce((acc, cur) => acc + cur.F2022, 0) / countries.length;
        console.timeEnd('findQuery');
        console.log("Среднее изменение температуры (без агрегации):", averageTemperatureChange);

        // Запрос с агрегацией
        console.time('aggregateQuery');
        const result = await collection.aggregate([
            { $group: { _id: null, averageTemperatureChange: { $avg: "$F2022" } } }
        ]).toArray();
        console.timeEnd('aggregateQuery');
        console.log("Среднее изменение температуры (с агрегацией):", result[0].averageTemperatureChange);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
