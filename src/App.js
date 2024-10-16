import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import PokeTable from './PokeTable';

function App() {

  const [InputName, setInputName] = useState("");
  const [PokeData, setPokeData] = useState("");
  let [Generation, setGeneration] = useState("");
  let [Evolution, setEvolution] = useState(0);

  const URL = "https://pokeapi.co/api/v2/pokemon/"

  let randomPick = Math.round(Math.random() * 1025);

  function GetPokeData() {
    let PokeReq = fetch(URL + randomPick + "/");
    PokeReq.then(Pokedata => Pokedata.json()
    .then((data) => {
      setPokeData(data);
    })
    )
  }

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

  let Type1 = "";
  let Type2 = "none";
  if(PokeData.length != 0)
  {
    Type1 = PokeData.types[0].type.name;
    if(PokeData.types.length > 1)
    {
      Type2 = (PokeData.types[1].type.name);
    }
    const genURL = PokeData.species.url;
    fetch(genURL)
    .then(response => response.json()
      .then( genData=> {
        let generation = genData.generation.name ;
        const romanNumeral = generation.match(/generation-(.*)/)[1];
    
        let evoList = GetEvo(genData.evolution_chain.url);

        const evoNum = evoList.map((data,index) => {
          if(data.species_name === PokeData.name)
            return index + 1;
        })

        setEvolution(evoNum);
        setGeneration(romanNumeral);
      })
  )

  }
  return (
    <div className="App">
      <input type="text" className='form__field' onChange={(event) => {setInputName(event.target.value)}} placeholder='Input Pokemon Name'/> <br />
      {/* <button onClick={GetPokeData}>Choose Random Pokemon!</button> */}
      <PokeTable PokeguessedName={InputName} RandomlyChoosePokemon={PokeData} Type1={Type1} Type2={Type2}  Generation={Generation} Evolution={Evolution}></PokeTable>
    </div>
  );
}

export default App;
