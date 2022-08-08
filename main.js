
//We Wait Till The Complete Page Is Loaded, Till Then We Show Loading Screen
window.addEventListener('load', () => {

    
    //Vanishes the Loading Screen
    document.getElementById('loader-wrapper').className = 'anime_hidedown';
    setTimeout(() => {
        document.getElementById('loader-wrapper').style.display = 'none';
        document.querySelectorAll('#loader-wrapper > *').forEach(item => {
            item.className = '';
        })
    }, 1000);


    

    const grid = document.querySelector('.grid');//Retreives Element From DOM with a class of grid
    const width= 8;//Width of the grid
    
    const candyColors = ['url(images/red.png)', 'url(images/green.png)', 'url(images/purple.png)', 'url(images/orange.png)', 'url(images/blue.png)', 'url(images/yellow.png)'];//Candy Colors we want to use
    const emptyImg = '';//Empty Square Image

    const squares = [];//Array of every Square holding candy in the grid
    
    let score = 0;//Player Score 1 point per Candy
    const scoreSpan = document.querySelector('.score span');

    let squareBeingDragged;//Square That is Being Dragged
    let squareBeingReplaced;// Square That is Being Replaved

    //Sound Effects
    let switchAudio = new Audio('./audios/switch_sound1.wav');
    let negativeSwitchAudio = new Audio('./audios/negative_switch_sound1.wav');
    let candyMatchAudio = new Audio('./audios/combo_sound12.wav');
    
    //Background Music
    let bgm = new Audio('./audios/candyCrushBgm.mp3');
    let bgmStatePlaying = false;
    bgm.loop = true;
    


    //Excalmations
    let exclam_counter = 0;
    const exclam_elem = document.querySelector('.exclam');
    const exclam_imgs = ['images/ex_divine.png' , 'images/ex_tasty.png','images/ex_sweet.png','images/ex_delicious.png'];
    const exclam_audios = [new Audio('./audios/ex_divine.wav') , new Audio('./audios/ex_tasty.wav'), new Audio('./audios/ex_sweet.wav'), new Audio('./audios/ex_tasty.wav')];

    //Removing Candies Animation Class 
    let animeRemove = 'anime_sizedown';


    //Generates Random Candies and Creates Board
    function createBoard(){
        for(let i = 0; i < width*width; i++){
            const square = document.createElement('div');//Creates a new div element

            square.setAttribute('draggable', true);//Makes Element Draggable
            square.setAttribute('id', i);//Assigns it an id
            
            squares.push(square);//Assigns array this newly created Element

            let randomColor = Math.floor(Math.random() * candyColors.length);//Generates a random number

            square.style.backgroundImage = candyColors[randomColor];// a Random color is assigned to square as backgroun color

            grid.appendChild(square);//Square is assigned to grid as child in the DOM
        }
    }

    createBoard();


    //Handling Squares Drag Drop Events

    //Below Two Functions add blur you can remove them if you want to
    grid.addEventListener('mouseenter', () => {
        document.getElementById('backdrop').style.filter = 'blur(3px)';
    })
    grid.addEventListener('mouseleave', () => {
        document.getElementById('backdrop').style.filter = 'blur(1px)'
    })

    //Drag Events
    grid.addEventListener('dragstart', (event) => {
        squareBeingDragged = event.target;

        if(!bgmStatePlaying){
            bgm.play();
            //Maybe decrease The Volume;
            bgmStatePlaying = true;
        }

        //Effects
        setTimeout(() => squareBeingDragged.style.opacity = 0, 0);//Gives An Illusion as when element is dragged it is removed from gird
        
    })



    //Makes Squares Valid Dropable Tragets
    grid.addEventListener('dragover', () => {event.preventDefault();})


    //Below function is called whenever a candy is dropped
    grid.addEventListener('drop', (event) => {  
        squareBeingReplaced = event.target;

        //Audios
        switchAudio.play();
    
        //any Information we are retreiving from DOM is in string so to do mathematical operations we first convert them into numbers
                
        //Stores the valid Block positions, where the square being dragged can be dragged to
        const validMoves = [parseInt(squareBeingDragged.id)-1, parseInt(squareBeingDragged.id)+1, parseInt(squareBeingDragged.id)-width, parseInt(squareBeingDragged.id)+width];
        //Determines if the square being dragged is dropped at valid block position
        const validMove = validMoves.includes(parseInt(squareBeingReplaced.id));
        
        //Background color Will Only change if square is only dragged one block up, down, right or left;
        if(validMove){

            //backColor stores color temporarily so the replacement of color can take place
            //Here We Exchange Candies
            const backImg = squareBeingReplaced.style.backgroundImage;
            squareBeingReplaced.style.backgroundImage = squareBeingDragged.style.backgroundImage;
            squareBeingDragged.style.backgroundImage = backImg;
            
            //If The square background is not empty that means it doesn't form a match so we return them back to their places
            //Wait 300 miliseconds and then check, this timeout is very important to notice change and also let the game loop run

            //Be Careful With Timing here
            //Timeout should be more than the timeout at update game
           setTimeout(() => {
                if(!(squareBeingReplaced.classList.contains(animeRemove))){
                    squareBeingDragged.style.backgroundImage = squareBeingReplaced.style.backgroundImage;
                    squareBeingReplaced.style.backgroundImage = backImg;
                    //Audios
                    negativeSwitchAudio.play();
                }else{

                }
            }, 300);

        }        
    })

    grid.addEventListener('dragend', () => {

        //Effects
        squareBeingDragged.style.opacity = 1;
    })

    //Checking For Matching Candies

    //Generates Invalid Positions
    function generateInvalidPos(squaresToCheck){
        //Just subtract one once becuase index is 1 less then the original value
        let newWidth = width - 1;
        let maxWidth = (width * width)-1;//Total Squares
        let squaresToRemove = squaresToCheck-1;//
        let invalidPos = [];//Array That Holds Invalid Square Positions

        //Loop Detects Invalid Squares and assign the positions to array invalidPos
        while(true){

            for(let i = 0; i < squaresToRemove; i++){
                invalidPos.push(newWidth-i);
            }
            
            if(newWidth < maxWidth){
                newWidth += width;
            }else{
                return invalidPos;//return statement will break the loop itself
            }
        }
    }
    
    //Checks Rows For Matching Candies
    function checkRowBgs(minSquaresToCheck, startPoint){
        
        let result = false; // Result will be true if there are 3 matching candies
        const endPoint = startPoint+(minSquaresToCheck-1);
        const invalidPos = generateInvalidPos(minSquaresToCheck);

        //Loop Checks For Matching Candies
        if(endPoint < squares.length && !(invalidPos.includes(parseInt(squares[startPoint].id)))){

            for(let i = startPoint; i < endPoint; i++){ 
                if(squares[i].style.backgroundImage === squares[i+1].style.backgroundImage){
                    result = true;
                }else{
                    result = false;
                    break;
                }
            }
        }
        
        //We increase Score Here and Add Animations to matching candies
        if(result && squares[startPoint].style.backgroundImage !== emptyImg ){//Removing The statement after && breaks The Game
            score += minSquaresToCheck;
            for(let i = startPoint; i < endPoint; i++){
                squares[i].classList.add(animeRemove);
                squares[i+1].classList.add(animeRemove);
            }
        }

        return result;
    }

    //Checks Columns For Matching Candies in Column
    function checkColumnBgs(minSquaresToCheck , startPoint){
        
        let result = false;

        for(let i = 0; i < minSquaresToCheck-1; i++){//subtracting 1 from SquaresToCheck doesn't effect the result
            if(startPoint+(width*(i+1)) < squares.length){
                if(squares[startPoint+(width*i)].style.backgroundImage === squares[startPoint+(width*(i+1))].style.backgroundImage){
                    result = true;
                }else{
                    result = false;
                    break;
                }
            }else{//This is to avoid selecting last remaining blocks they are invlaid
                result = false;
                break;
            }
        }
        
        if(result && squares[startPoint].style.backgroundImage !== emptyImg ){ //Removing The statement after && breaks The Game
            score += minSquaresToCheck;
            for(let i = 0; i < minSquaresToCheck-1; i++){
                squares[startPoint+(width*i)].classList.add(animeRemove);
                squares[startPoint+(width*(i+1))].classList.add(animeRemove);
            }
        }

        return result;
    }

    //This Removes The Matching Candies From Grid
    function removeMatches(){
        squares.forEach((item) => {
            //If This Element Has A Animation
            if(item.classList.contains(animeRemove)){
                //Remove That Animation
                item.classList.remove(animeRemove);//We will use this to fill out empty squares
                //And Set It To an Empty Image
                item.style.backgroundImage = emptyImg;

                //Effects
                candyMatchAudio.play();
                exclam_counter++;
            }
        })
    }

    //Making New Candies Appear on Board
    function fillEmptySquares(){ 
        //Checks The First Row for any empty squares and fills them so afterwards we can use upper squares to fill all lower squares
        for(let i = 0; i < width; i++){
            if(squares[i].style.backgroundImage === emptyImg){
                const randomColor =  Math.floor(Math.random() * candyColors.length);
                squares[i].style.backgroundImage = candyColors[randomColor];
            }
        }

        //Checks if there are any empty squares
        if(squares.some( (item) => item.style.backgroundImage === emptyImg)){
            squares.forEach( (item) => {
                if(squares[parseInt(item.id)].style.backgroundImage === emptyImg){
                    if(parseInt(item.id)-width >= 0){
                        
                        setTimeout(() => {//To Notice The Change
                            const currentItemId = parseInt(item.id);
                            const itemAboveId = parseInt(item.id)-width;//Gives the id of square above current square

                            squares[currentItemId].style.backgroundImage = squares[itemAboveId].style.backgroundImage;
                            squares[itemAboveId].style.backgroundImage = emptyImg;
                        }, 100);
                    }
                }
            })
        }
    }

    //This Shows Exclamations E.g: Sweet Tasty
    function setExclams(){
        
        exclam_elem.setAttribute('style', 'display: block');

        let ex_random = Math.floor(Math.random() * exclam_imgs.length);

        exclam_elem.src = exclam_imgs[ex_random];
        
        exclam_elem.classList.add('anime_ex');

        
        setTimeout(() => {
            exclam_elem.classList.remove('anime_ex'); 
            exclam_elem.setAttribute('style', 'display: none');
        }, 1000);
        

        exclam_audios[ex_random].play();

    }

    //Pauses Execution For ms(miliseconds)
    async function sleep(ms){
        await new Promise ((resolve) => {
                setTimeout(() => {
                    resolve();
                }, ms);
        })
    
        return true;
    }

    
    //Game Loop
    setInterval(async () => {
        
        //Checks Rows For Matching Candies
        squares.forEach( item => checkRowBgs(3, parseInt(item.id)));
        //Checks columns For Matching Candies
        squares.forEach( item => checkColumnBgs(3, parseInt(item.id)));

        //Lets the remove animation run and them removes candies
        await sleep(200).then(() => removeMatches());

        scoreSpan.innerHTML = score;

        fillEmptySquares();

        if(exclam_counter >= 30){
            exclam_counter = 0;
            setExclams();
        }

    }, 250);//Time out should be greater than the total time inner Promises take To Complete
    

})