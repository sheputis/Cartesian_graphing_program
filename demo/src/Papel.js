import React, { Component } from 'react';
import { PaperScope,Path,Point,Project,Group,PointText, project, tool,hitTest, } from 'paper'
import './papel.css';

class Papel extends Component {
  constructor(){
    super();

    this.state={
    }

    window['paper'] =  new PaperScope();
  }


  render() {
        return (

            <canvas id="paper" width={600} height={600} />


        )
    }
    componentDidMount() {
        let scope =window['paper'] ;

        scope.setup(document.getElementById('paper'));

        var grid_color= "#e9e9e9";
        var grid_color_smaller = "	#F5F5F5";
        var axis_color="#3f3f3f";
        var grid_size_smallest = 100; //these are the limits of what the grid_size in pixel can span
        var grid_size_largest  = 200; //
        var grid_size=grid_size_smallest; //the amount of pixels that a grid length spans
        var grid_size_x = grid_size+50;
        var grid_size_y = grid_size+20;
        var canvas_width = scope.scrollWidth; //the height and the width of the canvas element
        var canvas_height = scope.scrollHeight;
        console.log(canvas_height)
        var num_lines_x = Math.floor(canvas_height/grid_size_x);
        var num_lines_y = Math.floor(canvas_width/grid_size_y);
        var origo = new Point(100,500); //Real coordinates for the origin//

        var x_axis_ori=origo.y/grid_size_y; // where the axis origin is located//
        var y_axis_ori=origo.x/grid_size_x; //x_axis is the y coordinate of the x-line, the number of grid lines from the boundaries

        var num_scale = 1;     //the scaled, cartesian length of a square
        var num_scale_x = num_scale;
        var num_scale_y = num_scale;
        var precision = 10;      // to what decimal you want the coordinates to be rounded


        // lines arrays that will contain a path line in each slot
        var lines_x= new Group(); // this will be filled in set_up_x_grid()
        var lines_y= new Group(); // --||-- --||-- --||--   set_up_y_grid()
        var lines_x_smaller = new Group() // smaller grids
        var lines_y_smaller = new Group()
        var x_axis = new Path();
        var y_axis = new Path();

        //the following variables are specifically used for zooming in and out from the mouse position in the zoom() function
        var mouse_pos_pixel_old = 0;
        var mouse_pos_cart = 0;
        var mouse_pos_pixel_new = 0;
        var mouse_pos_pixel_delta = 0;

        // updating the grid size, the origin in both pixel and cartesian.
        function update_parameters(grid_size_x,grid_size_y,origo_) //this function is used for every iteration of OnFrame() and for every onMouseDrag() events
        {
          origo.x = origo_.x;
          origo.y = origo_.y;
          x_axis_ori=origo.y/grid_size_y;
          y_axis_ori=origo.x/grid_size_x;
        }
        function set_up_x_grid_smaller() //setting up the smaller horisontal grid line objects to form the final grid
        {
         var grid_size_smaller = grid_size_y/5 ;
         var num_lines_x_smaller = num_lines_x * 8 ;

         var a = (lines_x.firstChild.position.y)/grid_size_smaller;//
         //the very first x line is being drawn
         var first_line = lines_x.firstChild.clone()
         lines_x_smaller.addChild(first_line);
         lines_x_smaller.strokeColor = grid_color_smaller;

         // copying the first line object and pasting it downwards with intervals

         for (var i=1;i<=num_lines_x_smaller; i++ )
         {
           var line =first_line.clone();
           line.segments[0].point.y=grid_size_smaller*(i+a);
           line.segments[1].point.y=grid_size_smaller*(i+a)
           lines_x_smaller.addChild(line);

         }
          lines_x_smaller.sendToBack();
        }
        function update_x_grid_smaller() // used in each iteration to update the smaller horisontal grid objects
        {
          var grid_size_smaller = grid_size_y/5 ;
          var num_lines_x_smaller = num_lines_x * 8 ;
          var a = (x_axis_ori - Math.floor(x_axis_ori))*5;
          for (var i = 0; i <= num_lines_x_smaller; i++ ) // updating the new positions of the grids
          //  for (var i = 0; i <= lines_x_smaller.children.length; i++ ) // updating the new positions of the grids
          {
            lines_x_smaller.children[i].segments[0].point.y=grid_size_smaller*(i+a - 5);
            lines_x_smaller.children[i].segments[1].point.y=grid_size_smaller*(i+a - 5);
          }
          for(var i = 1; i < lines_x_smaller.children.length - num_lines_x_smaller;i++) // if there are too many grids, we put them outside the canvas temporarily
          {
            lines_x_smaller.children[i + num_lines_x_smaller].segments[0].point.y=canvas_height+20;
            lines_x_smaller.children[i + num_lines_x_smaller].segments[1].point.y=canvas_height+20;
          }
          lines_x_smaller.sendToBack();
        }
        function set_up_y_grid_smaller() //setting up vertical grid line objects to form the final grid
        {
         var grid_size_smaller = grid_size_x/5 ;
         var num_lines_y_smaller = Math.floor(num_lines_x * 8) ;
         //the very first x line is being drawn
         var a = (lines_y.firstChild.position.x)/grid_size_smaller;//
         var first_line = lines_y.firstChild.clone();
         lines_y_smaller.addChild(first_line);
         lines_y_smaller.strokeColor = grid_color_smaller;

         // copying the first line object and pasting it downwards with intervals

         for (var i=1;i<=num_lines_y_smaller; i++ )
         {
           var line =first_line.clone();
           line.segments[0].point.x = grid_size_smaller*(i+a-5);
           line.segments[1].point.x = grid_size_smaller*(i+a-5);
           lines_y_smaller.addChild(line);

         }
         lines_y_smaller.sendToBack();
        }
        function update_y_grid_smaller() // used in each iteration to update the smaller vertical grid objects
        {
          var grid_size_smaller = grid_size_x/5 ;
          var num_lines_y_smaller = Math.floor(num_lines_y * 8) ;
          var a = (y_axis_ori - Math.floor(y_axis_ori))*5;
          //  for (var i = 0; i <= num_lines_y_smaller; i++ ) // updating the new positions of the grids
          for (var i = 0; i < lines_y_smaller.children.length; i++ )
          {
            lines_y_smaller.children[i].segments[0].point.x=grid_size_smaller*(i+a - 5);
            lines_y_smaller.children[i].segments[1].point.x=grid_size_smaller*(i+a - 5);
          }

          for(var i = 1; i < lines_y_smaller.children.length - num_lines_y_smaller;i++) // if there are too many grids, we put them outside the canvas temporarily
          {
            lines_y_smaller.children[i + num_lines_y_smaller].segments[0].point.x=canvas_height+20;
            lines_y_smaller.children[i + num_lines_y_smaller].segments[1].point.x=canvas_height+20;
          }
          lines_y_smaller.sendToBack();
        }
        function set_up_x_grid() //setting up the main horisontal grid line objects that will be numbered
        {
         //the very first x line is being drawn

         var a = x_axis_ori - Math.floor(x_axis_ori);
         var from = new Point(0,a*grid_size_y);
         var to = new Point(canvas_width,a*grid_size_y);
         var first_line = new Path.Line(from, to);
         lines_x.addChild(first_line);
         lines_x.strokeColor = grid_color;

         // copying the first line object and pasting it downwards with intervals

         for (var i=1;i<=num_lines_x; i++ )
         {
           var line = first_line.clone();
           line.segments[0].point.y=grid_size_y*(i+a);
           line.segments[1].point.y=grid_size_y*(i+a)
           lines_x.addChild(line);
         }
         // adding and coloring the x axis:
         x_axis=new Path();
         x_axis.strokeColor=axis_color;
         x_axis.add(new Point(0,grid_size_y*x_axis_ori));
         x_axis.add(new Point(canvas_width,grid_size_y*x_axis_ori));
         x_axis.name = "x_axis";
        }
        function set_up_y_grid() //setting up the main vertical grid line objects that will be numbered
        {

           //the very first y line is being drawn
           var a = y_axis_ori - Math.floor(y_axis_ori);
           var from = new Point(a*grid_size_x,0);
           var to = new Point(a*grid_size_x,canvas_height);
           var first_line = new Path.Line(from, to);
           lines_y.addChild(first_line);
           lines_y.strokeColor = grid_color;

           // copying the first line object and pasting it downwards with intervals

           for (var i=1;i<=num_lines_y; i++ )
           {
             var line =first_line.clone();
             line.segments[0].point.x=grid_size_x*(i+a);
             line.segments[1].point.x=grid_size_x*(i+a);
             lines_y.addChild(line);
          //   line.removeSegments(); // taking uneccessary objects out of the memory
            }
           // adding and coloring the y axis:

           y_axis=new Path();
           y_axis.strokeColor=axis_color;
           y_axis.add(new Point(grid_size_x*y_axis_ori,0));
           y_axis.add(new Point(grid_size_x*y_axis_ori,canvas_height));
           y_axis.name = "y_axis";
        }
        function update_x_grid() //used in each iteration to update the horisontal grid objects
        {
          var a = x_axis_ori - Math.floor(x_axis_ori);
          for (var i = 0; i <= num_lines_x; i++ ) // updating the new positions of the grids
          {
            lines_x.children[i].segments[0].point.y=grid_size_y*(i+a);
            lines_x.children[i].segments[1].point.y=grid_size_y*(i+a);
          }
          for(var i = 1; i < lines_x.children.length - num_lines_x;i++) // if there are too many grids, we put them outside the canvas temporarily
          {
            lines_x.children[i + num_lines_x].segments[0].point.y=canvas_height+20;
            lines_x.children[i + num_lines_x].segments[1].point.y=canvas_height+20;
          }
          // updating the x axis also
          x_axis.segments[0].point.y = grid_size_y*x_axis_ori;
          x_axis.segments[1].point.y = grid_size_y*x_axis_ori;

        }
        function update_y_grid() //used in each iteration to update the horisontal grid objects
        {
          var a = y_axis_ori - Math.floor(y_axis_ori);
          for (var i = 0; i <= num_lines_y; i++ ) // updating the new positions of the grids
          {
            lines_y.children[i].segments[0].point.x=grid_size_x*(i+a);
            lines_y.children[i].segments[1].point.x=grid_size_x*(i+a);
          }
          for(var i = 1; i < lines_y.children.length - num_lines_y;i++) // if there are too many grids, we put them outside the canvas temporarily
          {
            lines_y.children[i + num_lines_y].segments[0].point.x=canvas_width+20;
            lines_y.children[i + num_lines_y].segments[1].point.x=canvas_width+20;
          }
          y_axis.segments[0].point.x = grid_size_x*y_axis_ori;
          y_axis.segments[1].point.x = grid_size_x*y_axis_ori;
        }
        function set_up_numbers_on_y_axis()   //here we draw the numbers on the y axis//
        {

         for(var i=-x_axis_ori;i<num_lines_x-x_axis_ori+2;i++)
         {
           if (Math.floor(i)!=0 )// && Math.floor(i)%2==0 this here is for every other line to be numbered
           {
             var text = new PointText(origo+ { x: -20, y: (Math.floor(i))*(grid_size_y) });
             text.justification = 'center';
             text.fillColor = axis_color;
             text.content = - fix_the_nr(Math.floor(i)*num_scale_y,nr_of_scalings_y);
           }
         }
        }
        function set_up_numbers_on_x_axis() //here we draw the numbers on the x axis//
        {
         for(var i=-y_axis_ori+1;i<num_lines_y-y_axis_ori+2;i++)
         {
           if (Math.floor(i)!=0) // &&Math.floor(i)%2==0
           {
             var text = new PointText(origo+ { x: Math.floor(i)*grid_size_x, y: 0.5*25 });
             text.justification = 'center';
             text.fillColor = axis_color;
             text.content = fix_the_nr(Math.floor(i)*num_scale_x,nr_of_scalings_x);
           }
         }
        }
        function real_to_cartesian_r(r_point)
        {
           var r_point=r_point;
           var c_point=new Point(0,0);
           c_point.x= Math.round((r_point.x/grid_size_x-y_axis_ori)*num_scale_x*precision)/precision;
           c_point.y=-Math.round((r_point.y/grid_size_y-x_axis_ori)*num_scale_y*precision)/precision;
           return c_point;
         }
        function real_to_cartesian(r_point) //real pixel coordinates to cartesian on the screen
        {
         var r_point=r_point;
         var c_point=new Point(0,0);
         c_point.x=(r_point.x/grid_size_x-y_axis_ori)*num_scale_x;
         c_point.y=-(r_point.y/grid_size_y-x_axis_ori)*num_scale_y;
         return c_point;
        }
        function cartesian_to_real(c_point) // from cartesian on the screen to real pixel coordinates
        {
           var c_point=c_point;
           var r_point=new Point(0,0);
           r_point.x=(c_point.x/num_scale_x+y_axis_ori)*grid_size_x;
           r_point.y=(-c_point.y/num_scale_y+x_axis_ori)*grid_size_y;
           return r_point;
         }
        function remove_all_PointText() //to remove numbers from the axis at each onFrame
        {
         var PointTexts = project.getItems(
           {
             class: PointText,
           }
         )
         var contains_PointText = false;
         if(PointTexts.length > 0){contains_PointText = true;}

         for(var i = 0; i<PointTexts.length; i++)
         {
           PointTexts[i].remove();
         }
        }
        var circle1_pos;
        var circle1_pos_cart;
        var circle1;
        var circle2_pos;
        var circle2_pos_cart;
        var circle2;
        function create_circles() // creating the two circles that will be moved around
        {
          circle1_pos = new Point(50,50);
          circle1_pos_cart = real_to_cartesian(circle1_pos)
          circle1 = new Path.Circle({
              center: circle1_pos,
                  radius:6,
          		fillColor: {
          			hue: 7,
          			saturation: 0.4,
          			brightness: 0.7,
          		},
          //    strokeColor:"black",
            //  strokeWidth:2,
          	// 	blendMode: 'lighter',
          	}
          );
          //circle1.fillColor = 'green';
          // circle1.radius = 10;
          circle1.bringToFront();
          circle1.name = 'pshh1';


          circle2_pos = new Point(190,50);
          circle2_pos_cart = real_to_cartesian(circle2_pos)
          circle2 = new Path.Circle({
              center: circle2_pos,
                  radius: 6,
          		fillColor: {
          			hue: 0.5 * 360,
          			saturation: 0.4,
          			brightness: 0.7,
          		},
            //  strokeColor:"black",
            //  strokeWidth:2,
          	// 	blendMode: 'lighter',
          	}
          );
          circle2.bringToFront();
          circle2.name = 'pshh2';
        }
        var linex;
        function create_line_between_circles()
        {
          linex= new Path();
          linex.strokeColor = 'black';
          linex.strokeWidth = 1;
          linex.add(circle1.position);
          linex.add(circle2.position);
          update_linex()
          linex.bringToFront();
          circle2.bringToFront();
          circle1.bringToFront();
        }
        function update_circles_and_line() //used in each iteration to update the circle objects
        {
          circle1.position = cartesian_to_real(circle1_pos_cart)
          circle2.position = cartesian_to_real(circle2_pos_cart)

          circle1.bringToFront();
          circle2.bringToFront();

          update_linex();


        }
        var linex_seg_1_cart;
        var linex_seg_2_cart;
        function update_linex() // updates the line between the circles
        {
          var a=(circle1.position.y-circle2.position.y)/(circle1.position.x-circle2.position.x);
          var b=circle1.position.y-a*circle1.position.x
          var point0=new Point(0,b);
          var point1=new Point(600,a*600+b);
          linex.segments[0].point=point0; linex_seg_1_cart = real_to_cartesian(point0);
          linex.segments[1].point=point1; linex_seg_2_cart = real_to_cartesian(point1);
        }
        function check_if_clicked_on_circle(hitResult) //this function is used in onMouseDown() and returns TRUE if the circle has been clicked
        {
          var circle_move_ = false;
          if (hitResult!=null)
          {
           if (hitResult.type == 'segment'  && (hitResult.item.name == 'pshh1'  || hitResult.item.name == 'pshh2'))// && hitResult.item.name = 'pshh'
           {
             circle_move_=true;
             move_who= hitResult.item;
           }
          }
          return circle_move_;
        }
        function drag_the_circle_and_update_line(event) // event is the instance of the mouse position, which updates the circle that is dragged and then the line is updated
        {
          move_who.position = event.point; //assigning the circle position to
          update_linex()
          if(move_who.name == 'pshh1'){circle1_pos_cart = real_to_cartesian(move_who.position)}
          else if(move_who.name == 'pshh2'){circle2_pos_cart = real_to_cartesian(move_who.position)}

        }
        function function_activate(event) // tangent has to either be false or true, true if function input, false if tangent line
        {
          try{
            var x; //this is needed here, because we're checking if eval() function is recognizing the f(x) as an input
            nr_of_functions++;
            var function_string= document.getElementById('function_input').value;;
            execute_this.push('y = ' + function_string);
            eval(execute_this[nr_of_functions])
            create_function(); //plotting the function for the first time
            plot_function(nr_of_functions);
          }
          catch(err)
          {
            console.log(err.message)
            execute_this.pop() // removes the last element of the array
            nr_of_functions--;
          }


        }
        var nr_points;
        function create_function() // initializing the function to be plotted, with numbers of points and so on.
        {

          var creating_the_function_path = "plotted_function_" + nr_of_functions + " = new Path()";
          var putting_the_color = "plotted_function_" + nr_of_functions + ".strokeColor = 'black'";
          var putting_strokeWidth = "plotted_function_" + nr_of_functions + ".strokeWidth = 2 ";
          var add_a_segment_to_path = "plotted_function_" + nr_of_functions + ".add()";
          //initializing the sceleton segments for the function to be plotted
          nr_points = 1000; // nr of points that plot the function
          eval(creating_the_function_path)  //plotted_function = new Path();
          eval(putting_the_color)//plotted_function.strokeColor = 'black';
          eval(putting_strokeWidth)//plotted_function.strokeWidth = 1.2;
          for(var i = 0; i < nr_points; i++)
          {
            eval(add_a_segment_to_path);//plotted_function.add();
          }


        }
        function plot_function(nr_of_function) // used in each iteration to plot the function
        {
          //var boundaries_upper_left = [real_to_cartesian(new Point(0,0)), real_to_cartesian(new Point(canvas_width,canvas_height))]
          var  dx = canvas_width/(nr_points-1);
          var x; var y; var x_real; var y_real;
          for(var i = 0; i < nr_points; i++)
          {
            try
            {
              x_real = i*dx;
              x = real_to_cartesian({x: x_real, y: 0}).x;
              eval(execute_this[nr_of_function])    //y = Math.cos(x);
              y_real = cartesian_to_real({x: 0, y: y}).y;
              if(y_real < 0){y_real = -10;}
              if(y_real > canvas_height ){y_real = canvas_height + 10}
              if(isNaN(y_real)){ y_real = -10}
              var plotting_the_function = "plotted_function_" + nr_of_function + ".segments[i].point = new Point(x_real, y_real)";
              eval(plotting_the_function);
            }
            catch(err){console.log(err.message)}
          }
          //  eval("plotted_function_" + nr_of_function + ".smooth()")
        }
        function plot_all_existing_functions()
        {
          for(var i = 1; i <= nr_of_functions; i++)
          {
            plot_function(i);
          }
        }
        function update_grid_size_by_zooming(event) //this function updates the grid_size when the wheel event is activated, the num_scale is also adjusted accordingly
        {
          var grid_delta = 10;  // this is the amount it is zoomed by, it has to be a divisor of grid_size_largest-grid_size_smallest
          //console.log('canvas H, W :' + canvas_height, canvas_width)
          if(event.deltaY<0)
            {
              grid_delta = grid_delta;
              grid_size_x+= grid_delta;
              grid_size_y+= grid_delta;
            }
          else
            {
              grid_delta = -grid_delta;
              grid_size_x+= grid_delta;
              grid_size_y+= grid_delta;
            }
          resize_and_rescale_the_grids();
        }
        var nr_of_scalings_x = 0; //number of scalings that has been done on scale = 1
        var nr_of_scalings_y = 0; //number of scalings that has been done on scale = 1
        function resize_and_rescale_the_grids()
        {
          if(grid_size_x >= grid_size_largest) // going down a scale in x
          {
            var delta_x = grid_size_x - grid_size_largest;
            grid_size_x = grid_size_smallest + delta_x;
            nr_of_scalings_x++;
            var Bool_sum = is_remainder_0(num_scale_x,5);
            if(Bool_sum[0]){num_scale_x = (num_scale_x*2)/5;grid_size_x= grid_size_x - 50;}
            else{num_scale_x = num_scale_x/2};
            num_scale_x = fix_the_nr(num_scale_x,nr_of_scalings_x);
          }
          if(grid_size_y >= grid_size_largest) // going down a scale in y
          {
            var delta_y = grid_size_y - grid_size_largest;
            grid_size_y = grid_size_smallest + delta_y;
            nr_of_scalings_y++;
            var Bool_sum = is_remainder_0(num_scale_y,5);
            if(Bool_sum[0]){num_scale_y = (num_scale_y*2)/5; grid_size_y = grid_size_y -50}
            else{ num_scale_y = num_scale_y/2};
            num_scale_y = fix_the_nr(num_scale_y,nr_of_scalings_y)};
          if(grid_size_x <= grid_size_smallest )// going up a scale in x
          {
            var delta_x = grid_size_smallest - grid_size_x;
            grid_size_x = grid_size_largest - delta_x;
            nr_of_scalings_x--;
            var Bool_sum = is_remainder_0(num_scale_x,2);
            if(Bool_sum[0]){num_scale_x = num_scale_x*2.5;grid_size_x= grid_size_x +50;} // +50 is accounting for the 2.5 factor in scale
            else{ num_scale_x = num_scale_x*2};
            num_scale_x = fix_the_nr(num_scale_x,nr_of_scalings_x)}
          if(grid_size_y <= grid_size_smallest )// going up a scale in y
          {
            var delta_y = grid_size_smallest - grid_size_y;
            grid_size_y = grid_size_largest - delta_y;
            nr_of_scalings_y--;
            var Bool_sum = is_remainder_0(num_scale_y,2);
            if(Bool_sum[0]){num_scale_y = num_scale_y*2.5;grid_size_y = grid_size_y +50}
            else{ num_scale_y = num_scale_y*2};
            num_scale_y = fix_the_nr(num_scale_y,nr_of_scalings_y)};
        }
        //console.log(parseInt(String(0.5)[0])%2)
        /*
        function bzz(nr,mult) // mult is z boolean value, if true, the multiply
        {
          var nr = String(nr);
          var indx = nr.indexOf('.')
          var len = nr.length;
          var n = len - indx - 1;
          pow_ = Math.pow(10,n)
          nr = nr*pow_;
          if(mult)
          {
            nr = (nr * 5)/2;
            nr = nr/pow_
          }
          else
          {
            nr = (nr * 2)/5;
            nr = nr
          }
          return nr
        }
        console.log(bzz('10.345'))
        */ // this is the floating point fix scetch, this will have to be imlemented over the string truncating
        function fix_the_nr(nr,nr_of_scalings)
        {
          var nr = String(nr);
          var indx = nr.indexOf('.')
          if(indx!= -1)
          {
            nr = nr.slice(0,indx+nr_of_scalings+1)
          }
          return parseFloat(nr)
        }
        console.log(fix_the_nr(123.12345,1))
        function rounding_to_digit(nr,digit)
        {
          return Math.round(nr * Math.pow(10,digit)) / Math.pow(10,digit);
        }

        function is_remainder_0(nr,modulus) // tells if the first digit of a number gives a 0 remainder or not(true/false), specifically designed for zooming, scaling
        {
          var sum = 0;
          nr = String(nr);
          while(nr[sum]=='0' || nr[sum]=='.'){sum++;if(nr.length<sum){break;}}
          var boolean = false;
          if(nr[sum]%modulus==0){boolean = true};
          return [boolean,sum]
        }
        function circles_activate()
        {
          var not_important = false;
          if(circle_exists == false) // if the button clicked, the circles are created and activated
          {
            circle_exists = true;
            create_circles(); //creating the circles and the line between them
            create_line_between_circles();
            not_important = true;
          }
          if(circle_exists == true && not_important == false) // if the button is clicked again, the circles are removed and deactivated
          {
            circle_exists = false;
            linex.removeSegments();
            circle1.removeSegments();
            circle2.removeSegments();
          }
        }
        function line_activate(event)
        {
          draw_a_line_boolean = true;
        }
        function line_deactivate(event)
        {
          draw_a_line_boolean = false;
        }
        function create_a_line_to_draw(event) // puts a line element in the array of lines and two cartesian end points in it's own array
        {
          nr_of_lines_to_draw++;
          var path = new Path((
            {
              strokeColor:
              {
                hue: 1 * 360,
                saturation: 0.4,
                brightness: 0.3,
              }
            }
          ));
          path.strokeWidth = 3;
          path.add(event.point);
          path.add(event.point);

          lines_to_draw.push(path)

          lines_to_draw_cartesian_pos.push([])

          lines_to_draw_cartesian_pos[nr_of_lines_to_draw].push(real_to_cartesian(event.point))
          lines_to_draw[nr_of_lines_to_draw].bringToFront();
        }
        function update_the_lines_to_draw()
        {
          for(var i = 1; i <= nr_of_lines_to_draw; i++)
          {
            lines_to_draw[i].segments[0].point = cartesian_to_real(lines_to_draw_cartesian_pos[i][0])
            lines_to_draw[i].segments[1].point = cartesian_to_real(lines_to_draw_cartesian_pos[i][1])
          }

        }
        function curve_activate()
        {
          draw_a_curve_boolean = true;
        }
        function curve_deactivate()
        {
          draw_a_curve_boolean = false;
        }
        function create_a_curve(event)
        {
          nr_of_curves++;
          var curvio = new Path({
            strokeColor:
            {
              hue: 1 * 360,
              saturation: 0.4,
              brightness: 0.3,
            },
          });
          curvio.strokeWidth = 3;
          curves_to_draw.push(curvio);
          curves_to_draw_cart_pos[nr_of_curves] = [];
        }
        function update_the_curves()
        {
          for(var i = 1; i < curves_to_draw.length; i++)
          {
          //  console.log(curves_to_draw.length)

            if(curves_to_draw[i].length > 0)
            {
              for(var j = 0; j <= curves_to_draw[i].lastSegment.index; j++)
              {

                curves_to_draw[i].segments[j].point = cartesian_to_real(curves_to_draw_cart_pos[i][j]);
              }
          }
          //
          }

        }
        function points_activate()
        {
          create_points_boolean = true;
        }
        var points_list_cart;
        var points_list;
        function create_points(event)
        {
          nr_of_points++;
          var middle_point = new Point(event.point);
          points_list_cart.push(real_to_cartesian(middle_point));
          var circle = new Path.Circle({
              center: middle_point,
                  radius: 8,
          		fillColor: {
          			hue: 0.5 * 360,
          			saturation: 0.4,
          			brightness: 0.7,
          		},
              strokeColor:"black",
              strokeWidth:2,
          	// 	blendMode: 'lighter',
          	}
          );
          points_list.push(circle);
          points_list[nr_of_points].bringToFront();
          points_list[nr_of_points].name = 'pshh';
          points_list[nr_of_points].nr = nr_of_points; // this is to numerate the points, so that we can save the cartesian pos in MouseUp function
        }
        function update_the_points()
        {
          for(var i = 1; i < points_list.length; i++)
          {
            points_list[i].position = cartesian_to_real(points_list_cart[i]);
          }
        }
        function check_if_clicked_on_point(hitResult) //this function is used in onMouseDown() and returns TRUE if the point has been clicked
        {
          var point_move_ = false;
          if (hitResult!=null)
          {
           if (hitResult.type == 'fill'  && hitResult.item.name == 'pshh')// && hitResult.item.name = 'pshh'
           {
             point_move_=true;
             move_who= hitResult.item;
           }
          }
          return point_move_;
        }
        function move_the_point(event)
        {
          move_who.position = event.point;
        }

        // scaling the axis by dragging
        var x_axis_drag_boolean = false;
        var y_axis_drag_boolean = false;
        function check_if_clicked_on_x_axis(hitResult) //this function is used in onMouseDown() and returns TRUE if the point has been clicked
        {
          var axis_move_ = false;
          if (hitResult!=null)
          {
           if (hitResult.type == 'stroke'  && hitResult.item.name == 'x_axis')// && hitResult.item.name = 'pshh'
           {
             axis_move_=true;
             move_who= hitResult.item;
           }
          }
          return axis_move_;
        }
        function check_if_clicked_on_y_axis(hitResult) //this function is used in onMouseDown() and returns TRUE if the point has been clicked
        {
          var axis_move_ = false;
          if (hitResult!=null)
          {
           if (hitResult.type == 'stroke'  && hitResult.item.name == 'y_axis')// && hitResult.item.name = 'pshh'
           {
             axis_move_=true;
             move_who= hitResult.item;
           }
          }
          return axis_move_;
        }
        function drag_the_x_axis(event)
        {
          var delta = event.delta;
          if(event.point.x>origo.x){grid_size_x += delta.x}
          else{grid_size_x -= delta.x}
        }
        function drag_the_y_axis(event)
        {
          var delta = event.delta;
          if(event.point.y>origo.y){grid_size_y += delta.y}
          else{grid_size_y -= delta.y}
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /*
          So the starting grid_size always has to be the size of the smallest possible grid size in the program.
          At the moment the constraints are set to from 100 to 200; so the starting grid_size has to be 100; if not, there will occur
          overindexing errors.
        */


        //setting up the variables for the line defined by the circles through it
        var circle_exists = false; // these variables denote the existence of objects on the graph, if TRUE, they will appear.
        // the following variables are for moving of the circles that define the line
        var circle_move=false; //if true, a circle object can be moved around in drag(), if false, the translation of the grid will ensue
        var move_who; // the circle object, which is going to be moved, will be referenced to this variable in onMouseDown()

        //setting up the parameters for maintainance of several functions, their number and their cartesian functions.
        var nr_of_functions = 0;
        var execute_this = ["shit"];//list of strings that each define their respective function

        // setting up the variables for drawing lines
        var draw_a_line_boolean = false; // if true, the line drawing will be activated
        var lines_to_draw = ['shit']; // the array that hosts the paths that define the lines that are drawn
        var nr_of_lines_to_draw = 0;
        var lines_to_draw_cartesian_pos = ['shit']; // every element will be another array of two cartesian points
        var path_pos1 = new Point();
        var path_pos2 = new Point();

        //setting up the variables for drawing curves
        var draw_a_curve_boolean = false;
        var curves_to_draw = ['shit'] // the array that will host all the curves
        var curves_to_draw_cart_pos = ['shit'] // the array that will host arrays of cartesian positions
        var nr_of_curves = 0;

        //setting up the variables for creating points:
        var create_points_boolean = false;
        var nr_of_points = 0;
        var points_list = ['shit'];
        var points_list_cart = ['shit'];
        var point_move_boolean = false; // this is for moving the point



        set_up_x_grid();  // setting up the horisontal grid elements
        set_up_y_grid();  // setting up the vertical grid elements

        set_up_x_grid_smaller();  // setting up the smaller horisontal grid elements
        set_up_y_grid_smaller();  // setting up the smaller vertical grid elements

        set_up_numbers_on_y_axis(); //  setting up the numbers along y axis
        set_up_numbers_on_x_axis(); //  setting up the numbers along x axis


        var hitOptions = {
          segments: true,
        	stroke: true,
        	fill: true,
        	tolerance: 10,
        };
    /*    scope.view.onMouseMove=function(event) //  function onMouseMove(event)
       // when hovering over an object, like axis
        {
            var hitResult = project.hitTest(event.point,hitOptions);
            if(check_if_clicked_on_x_axis(hitResult)){document.body.style.cursor = "w-resize";}
            else if(check_if_clicked_on_y_axis(hitResult)){document.body.style.cursor = "n-resize";}
            else{document.body.style.cursor = "default";}
        }
 */
        scope.view.onMouseDown=function(event)//  function onMouseDown(event)
        {
        // extracting the object that has been clicked on
        var hitResult = project.hitTest(event.point,hitOptions);
        console.log(hitResult)
        //checking if the object that has been hit is a circle, if so, circle_move is assing TRUE so that it can be moved around in drag()
        circle_move = check_if_clicked_on_circle(hitResult);
        point_move_boolean = check_if_clicked_on_point(hitResult);
        x_axis_drag_boolean = check_if_clicked_on_x_axis(hitResult);
        y_axis_drag_boolean = check_if_clicked_on_y_axis(hitResult);
        //console.log(x_axis_drag_boolean)
        //console.log(point_move_boolean)
        if(draw_a_line_boolean == true){create_a_line_to_draw(event)}// if the line was activated by a click, create it's object
        if(draw_a_curve_boolean == true){create_a_curve(event)}

        if(create_points_boolean == true ){create_points(event)}
        }



        //the mouse dragging event:
        scope.view.onMouseDrag=function(event) //  function onMouseDrag(event)

         {
           if(x_axis_drag_boolean == true){drag_the_x_axis(event);update_everything();resize_and_rescale_the_grids();}
           else if(y_axis_drag_boolean == true){drag_the_y_axis(event);update_everything();resize_and_rescale_the_grids();}//y_axis.strokeColor = 'brown';

           if (circle_move==true){drag_the_circle_and_update_line(event)}
           else if(point_move_boolean == true){move_the_point(event)}
           else if(circle_move == false && draw_a_line_boolean == false && draw_a_curve_boolean == false && point_move_boolean == false && x_axis_drag_boolean == false && y_axis_drag_boolean == false)
           {

             origo += event.delta; // updating the origin by the amount that the dragging mouse has moved
             update_parameters(grid_size_x,grid_size_y,origo)

             update_x_grid();
             update_y_grid();

             update_x_grid_smaller();
             update_y_grid_smaller();

             //numbers on the axis
             remove_all_PointText();
             set_up_numbers_on_x_axis(); set_up_numbers_on_y_axis();


             if(circle_exists == true){update_circles_and_line()}
             if(nr_of_functions > 0){plot_all_existing_functions();}
             if(nr_of_lines_to_draw > 0){update_the_lines_to_draw();}// a created line is being updated
             if(nr_of_curves > 0){update_the_curves();}
             if(nr_of_points > 0){update_the_points();}

           }
           if(draw_a_line_boolean == true){lines_to_draw[nr_of_lines_to_draw].segments[1].point = event.point;  lines_to_draw_cartesian_pos[nr_of_lines_to_draw][1]= real_to_cartesian(lines_to_draw[nr_of_lines_to_draw].segments[1].point)}// a created line object is being drawn
           if(draw_a_curve_boolean == true){
             tool.minDistance = 50;
             curves_to_draw[nr_of_curves].add(new Point(event.point));
             curves_to_draw_cart_pos[nr_of_curves].push(real_to_cartesian(event.point));} //adding path segments to the current curve
         }

        // when the mouse is up again, the circle_move has to go back to false
        function onMouseUp(event)
        {
          circle_move=false;
          //finishing drawing a line and adding the cartesian position in the array;
          if(draw_a_line_boolean == true)
          {
            draw_a_line_boolean = false;
            lines_to_draw_cartesian_pos[nr_of_lines_to_draw].push(real_to_cartesian(event.point));
          //  lines_to_draw[nr_of_lines_to_draw].bringToFront();
          }
          //
          if(draw_a_curve_boolean == true){draw_a_curve_boolean = false;curves_to_draw[nr_of_curves].smooth();}
          if(create_points_boolean == true){create_points_boolean = false;}
          if(point_move_boolean == true){points_list_cart[move_who.nr]=real_to_cartesian(event.point);point_move_boolean = false;}
          x_axis.strokeColor = 'black';
          y_axis.strokeColor = 'black';
          //setting the event intervals back to the small default value, because drawing, for example, is set to 20px
          tool.minDistance = 1;
        }

        //zoom in, out
/*
        scope.view.addEventListener("wheel",function(event){zoom(event)})
        function zoom(event)
        {
         remove_all_PointText();//removing all the point text objects before creating them over again later

         mouse_pos_pixel_old = {x:event.offsetX , y:event.offsetY};//getting the pixel pos of the mouse before the zooming
         mouse_pos_cart = real_to_cartesian(mouse_pos_pixel_old); // converting the position into cartesian

         update_grid_size_by_zooming(event);//this function updates the grid_size when the wheel event is activated, the num_scale is also adjusted accordingly

         update_parameters(grid_size_x,grid_size_y,origo);// by updating the parameters here, the zooming into the origin will take effect
         mouse_pos_pixel_new = cartesian_to_real(mouse_pos_cart) // finding where the cartesian position is after the zooming (in pixel)
         mouse_pos_pixel_delta = mouse_pos_pixel_new - mouse_pos_pixel_old; // finding the difference between these two pixel positions
         origo -= mouse_pos_pixel_delta; // we translate the whole grid by that difference in positions of the mouse before and after zooming
         update_parameters(grid_size_x,grid_size_y,origo); //by updating the parameters here, the translation will take effect, so that the zoom will be onto the mouse

         update_x_grid();
         update_y_grid();

         update_x_grid_smaller();
         update_y_grid_smaller();

         set_up_numbers_on_x_axis();
         set_up_numbers_on_y_axis();

         if(circle_exists == true){update_circles_and_line()}
         if(nr_of_functions > 0){plot_all_existing_functions();}
         if(nr_of_lines_to_draw > 0){update_the_lines_to_draw();}
         if(nr_of_curves > 0){update_the_curves();}
         if(nr_of_points > 0){update_the_points();}
        }
        */
        function update_everything()
        {
          remove_all_PointText();//removing all the point text objects before creating them over again later
          update_parameters(grid_size_x,grid_size_y,origo); //by updating the parameters here, the translation will take effect, so that the zoom will be onto the mouse

          update_x_grid();
          update_y_grid();

          update_x_grid_smaller();
          update_y_grid_smaller();

          set_up_numbers_on_x_axis();
          set_up_numbers_on_y_axis();

          if(circle_exists == true){update_circles_and_line()}
          if(nr_of_functions > 0){plot_all_existing_functions();}
          if(nr_of_lines_to_draw > 0){update_the_lines_to_draw();}
          if(nr_of_curves > 0){update_the_curves();}
          if(nr_of_points > 0){update_the_points();}
        }

        // debugging code with keys
        scope.view.onKeyDown=function(event) // function onKeyDown(event)
        {try
          {
          if(event.key == "1"){console.log(real_to_cartesian_r(cartesian_to_real(circle1_pos_cart)));} //writing out cartesian values, rounded up to 1 digit
          if(event.key == "2"){console.log(real_to_cartesian_r(cartesian_to_real(circle2_pos_cart)));}
          }
          catch(err)
          {
            console.log(err.message)
          }

        }


        /*
        document.getElementById("circles_button").addEventListener("click",function(event){circles_activate(event)})
        document.getElementById("function_button").addEventListener("click",function(event){function_activate(event)})
        document.getElementById("line1").addEventListener("click",function(event){line_activate(event)})
        document.getElementById("line2").addEventListener("click",function(event){line_deactivate(event)})
        document.getElementById("curve1").addEventListener("click",function(event){curve_activate()})
        document.getElementById("curve2").addEventListener("click",function(event){curve_deactivate()})
        document.getElementById("point").addEventListener("click",function(event){points_activate()})
        */
        circles_activate();
                scope.view.draw();


    }
}

export default Papel;
