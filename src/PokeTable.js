import { useState,useEffect } from 'react';

const PokeTable = ( {PokeguessedName, RandomlyChoosePokemon, Type1, Type2, Generation, Evolution} ) => {

  const [TableRows, setTableRows] = useState([]) 

  const addUniqueItem = (newItem) => {
    // Sprawdzamy, czy element o tym samym `id` już istnieje w tablicy
    const itemExists = TableRows.some(item => item.id === newItem.id);

    if (!itemExists) {
      // Jeśli element nie istnieje, dodajemy go do tablicy
      setTableRows(TableRows => [...TableRows, newItem]);
    } else {
      console.log('Element już istnieje');
    }
  };
  
  async function GetEvo(link)
  {
    const evoURL = link;
    let res = await fetch(evoURL);
    let data = await res.json();
    let evoChain = [];
    let evoData = data.chain;

    do {
      let numberOfEvolutions = evoData.evolves_to.length;
      evoChain.push({
        "species_name": evoData.species.name,
        "min_level": !evoData ? 1 : evoData.min_level,
        "item": !evoData ? null : evoData.item
      });

      if(numberOfEvolutions > 1) {
        for (let i = 1;i < numberOfEvolutions; i++) { 
          evoChain.push({
            "species_name": evoData.evolves_to[i].species.name,
            "min_level": !evoData.evolves_to[i]? 1 : evoData.evolves_to[i].min_level,
            "item": !evoData.evolves_to[i]? null : evoData.evolves_to[i].item
         });
        }
      }        

      evoData = evoData.evolves_to[0];

    } while (evoData != undefined && evoData.hasOwnProperty('evolves_to'));

    return evoChain;
  }
  

  async function GetGeneration(speciesId) {
    const url = speciesId;

    let call = await fetch(url);
    let d = await call.json();
    let generation = d.generation.name ;
    let evolutionchain = d.evolution_chain.url;
    const romanNumeral = generation.match(/generation-(.*)/)[1];

    const RetObj = {
      Generation: romanNumeral,
      EvolutionChain: evolutionchain
    };
    return RetObj;
  }
    

  function CollectData(Pokedata) {
    let MainType = Pokedata.types[0].type.name;
    let second = "none";
  
    if(Pokedata.types[1] != undefined)
    {
      second = Pokedata.types[1].type.name;
    }

    GetGeneration(Pokedata.species.url).then(gen => {
      GetEvo(gen.EvolutionChain).then(info => {
        console.log(info);
        
        const evoNum = info.map((data,index) => {
          if(data.species_name === Pokedata.name)
            return index + 1;
        })

        let Newobj = {
          Sprite: Pokedata.sprites.front_default,
          Name: Pokedata.name,
          Type1: MainType, 
          Type2: second, 
          Weight: Pokedata.weight, 
          Generation: gen.Generation,
          id: Pokedata.id,
          Evolution: evoNum
        };
        addUniqueItem(Newobj);
      }) 
    })
    
  }

  const AddTableRow = () => {

    PokeguessedName = PokeguessedName.toLowerCase();
    if(PokeguessedName == "")
    {
      return;
    }
    const URL = "https://pokeapi.co/api/v2/pokemon/" + PokeguessedName + "";
    fetch(URL).then(data => data.json()
    .then((Pokedata) => {
      CollectData(Pokedata);
    })
    )
  }

  return (
    <div className="PokeTable">
    <button className="guessBtn" onClick={AddTableRow}>Guess Pokemon!</button>
    <table>
      <tr>
        <th>Image: </th>
        <th>Name </th>
        <th>Type 1 </th>
        <th>Type 2 </th>
        <th>Weight </th>
        <th>Generation </th>
        <th>Evolution </th>
      </tr>
      {TableRows.map((Row) => (
      <tr className="Poke-preview" key={Row.id}>
        <td><img src={Row.Sprite} alt="" /></td>
        <td style={ {backgroundColor: Row.Name == RandomlyChoosePokemon.Name ? "Green" : "Red"} }>{Row.Name}</td>
        <td style={ {backgroundColor: Row.Type1 == Type1 ? "Green" : "Red"} }>{Row.Type1}</td>
        <td style={ {backgroundColor: Row.Type2 == Type2 ? "Green" : "Red"} }>{Row.Type2}</td>
        <td style={ {backgroundColor: Row.Weight == RandomlyChoosePokemon.Weight ? "Green" : "Red"} }>{Row.Weight}</td>
        <td style={ {backgroundColor: Row.Generation == Generation ?  "Green" : "Red"}}>{Row.Generation}</td>
        <td style={ {backgroundColor: Row.Evolution == Evolution ?  "Green" : "Red"}}> {Row.Evolution}</td>
      </tr> 
      ))}

    </table>
    </div>
    );
  }
export default PokeTable;