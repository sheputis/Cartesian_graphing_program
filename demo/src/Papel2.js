import React, { Component } from 'react';
import { PaperScope,Path,Point,Project } from 'paper'


class Papel extends Component {
  constructor(){
    super();

    this.state={
    }

    window['paper'] = new PaperScope();
  }


  render() {
        return (

            <canvas id="paper" width={200} height={520} />


        )
    }
    componentDidMount() {
        let scope =window['paper'] ;

        scope.setup(document.getElementById('paper'));
        var myCircle = new Path.Circle(new Point(100, 70), 50);
        myCircle.fillColor = 'red';
        scope.view.draw();


        var path = new Path.Rectangle([75, 75], [100, 100]);
        		path.strokeColor = 'black';

        		scope.view.onMouseDown = function(event) {
              console.log("perritos funciono");

        			path.rotate(1);
        		}


            var myPath = new Path();
            myPath.strokeColor = 'black';

            // This function is called whenever the user
            // clicks the mouse in the view:
            scope.view.onMouseDown=function(event) {
            	// Add a segment to the path at the position of the mouse:
            	myPath.add(event.point);
            }


    }
}

export default Papel;
