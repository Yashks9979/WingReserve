// async function ORM(){
//     const {City,Airport}=require('./models');

//     const bengaluru=await City.findByPk(1);
//     console.log(bengaluru);
//     const airport=await Airport.create({name:'KMP',code:'KMP',cityId:1});
//     const dbairport=await bengaluru.createAirport({name:'HBL',code:'HBL'});
//     console.log(dbairport);
//     const airportInBlr=await bengaluru.getAirports();
//     console.log(airportInBlr);

    //    const hbairport=await Airport.findByPk(3);
    //    console.log(hbairport);
    //    await bengaluru.removeAirports(hbairport);  it just mark the cityId to null but since we have set cityId constraint to allowNull false then it throw error>> 
    //if you want to delete then you have to manullay delete it using destroy method from the corresspondinf model>>
// }