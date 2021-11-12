import { Component, Input, OnInit } from "@angular/core";
import { DOCUMENT } from "@angular/platform-browser";
import { ActivatedRoute, Params, Router, Routes } from "@angular/router";
import { miserables } from "./miserables";
import * as d3 from 'd3';
import * as _ from 'lodash';

@Component({
  selector: "app-cluster",
  templateUrl: "./cluster.component.html",
  styleUrls: ["./cluster.component.css"],
})
export class ClusterComponent implements OnInit {


  @Input() public teamColor: any;
  @Input() public teamCode: any;
  @Input() public sportCode: any;
  public results: any = [];
  public recordMsg: string = "";
  public spinner: boolean = false;
  public nodes_data: any[] = miserables["data"];
  public links_data:  any[];
  public width: number = 1000;
  public height: number = 440;   
  public svg: any;
  public g: any;
  public bubbles: any;
  public nodes: any; 
  public tooltip: any;
  public simulation: any;
  public fillColor: any;
  public tt: any;
  public titleX: any ={};
  public labels: any;
  public showDetails: boolean= false;
  public player:any;
  public nodeCentres: any;
  public forceStrength = 0.03;
  public link_force:any;
  public links: any;
  public linkData: any;
  public total:  any[] =[];
  public bestTot:  any[]=[];
  public betterTot:  any[]=[];
  public goodTot:  any[]=[];

  constructor(
    private route: ActivatedRoute,
    private router: Router) {   
  }
  public ngOnInit() {    
    this.tooltip = this.floatingTooltip('gates_tooltip', 240);
    this.fillColor = d3.scaleLinear<string>().domain([1,20]).range(["#f77e94", "#9e1b32"]); 
    var chartDiv = document.getElementById("cluster-bubble");
    this.total = this.nodes_data.filter((d: any) =>{ 
      return d.type == "Player";
    });

    this.bestTot=this.nodes_data.filter((d: any) =>{ 
      return d.type != "Centriod" && d.group == "BEST";
    });
    this.betterTot =this.nodes_data.filter((d: any) =>{ 
      return d.type != "Centriod" && d.group == "BETTER";
    });
    this.goodTot= this.nodes_data.filter((d: any) =>{ 
      return d.type != "Centriod" && d.group == "GOOD";
    });
    let maxAmount =  d3.max(this.nodes_data, function (d: any) { return d.statINT ? +d.statINT : 0; });
    let radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([5, 10])
      .domain([0, maxAmount ? maxAmount : 200]);
    this.nodes_data = this.nodes_data.map((d: any) =>{ 
        d.radius= radiusScale(+d.statINT);
        d.sacks= d.sacks == 0 ? 1 : d.sacks;
        d.value= +d.statINT;
         return d;
    });
      var svg = d3.select("svg");
     
    this.links_data = this.nodes_data.filter((d: any) =>{ 
      d.source = d.name;
      d.target = d.group;
      return d.type != "Centriod";
    })
    this.width = chartDiv ? chartDiv.clientWidth : 1000;   
    this.svg = d3.select("#clusterChart")
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
    this.simulation= d3.forceSimulation()
    .nodes(this.nodes_data);
    var link_force =  d3.forceLink(this.links_data)
                      .id(function(d: any) { return d.name; })
                      .distance(50).strength(1);
    var charge_force = d3.forceManyBody().strength(-200);
    var center_force = d3.forceCenter(this.width / 2, this.height / 2);
    this.simulation
    .velocityDecay(0.8)
    .force("charge_force", charge_force)
    .force("center_force", center_force)
    .force("collide",d3.forceCollide())
    .force("x", d3.forceX(this.width / 2).strength(1))
    .force("y", d3.forceY(this.height / 2).strength(1))
    .force("links",link_force);
    this.simulation.on('tick',() => { return this.ticked() });
    this.g = this.svg.append("g")
    .attr("class", "everything");

    this.links = this.g.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(this.links_data)
    .enter().append("line")
    .attr("stroke-width", 2)
    .style("stroke","#bab6b6" );



    this.nodes= this.g.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(this.nodes_data)
    .enter()
    .append("circle")
    .attr('r', function (d: any) { 
        if(d.type == "Centriod")
          return 25;
        return d.radius; 
      }) 
    .attr("fill",(d: any) => { 
       if(d.type =="Centriod")
        return "#bab6b6";      
       return this.fillColor(d.sacks); 
    })
    .attr('stroke', (d: any) => { 
           if(d.isActive.trim()) return "#ffd740";
           return d3.rgb(this.fillColor(d.sacks)).darker(); 
      })
    .attr('stroke-width', 2)
    .on('click', this.onclick())
    .on('dblclick', this.dblclick())
    .on('mouseover', this.onMouseover())
    .on('mouseout', this.onMouseout());
        this.labels = this.g.append("g")
      .attr("class", "label")
      .selectAll("text")
      .data(this.nodes_data.filter((d: any) =>{ 
           return d.type == "Centriod";
      }))
      .enter().append("text")
      .text((d: any)=>{ 
          if(d.type == "Centriod")
          return d.group;
          return;
        })
      .attr("font-family","sans-serif")
      .attr("text-anchor","middle")
      .attr("font-size",(d: any) =>{
        return d.radius / ((d.radius * 10) / 100);
      })
      .on("start", this.drag_start())
      .on("drag", this.drag_drag())
      .on("end", this.drag_end());
    var drag_handler = d3.drag()
      .on("start", this.drag_start())
      .on("drag", this.drag_drag())
      .on("end", this.drag_end());
    drag_handler(this.nodes);
//add zoom capabilities 
    var zoom_handler = d3.zoom()
    .on("zoom", this.zoom_actions());
    zoom_handler(this.svg);    

 
  }

public ticked() {
    this.nodes
      .attr('cx', function (d: any) {
        return d.x;
      })
      .attr('cy', function (d: any) { return d.y; });
    this.links
        .attr("x1", function(d: any) { 
          return d.source.x; 
        })
        .attr("y1", function(d: any) { return d.source.y; })
        .attr("x2", function(d: any) { return d.target.x; })
        .attr("y2", function(d: any) { return d.target.y; });
    this.labels
        .attr("x", function(d: any) { return d.x; })
        .attr("y", function(d: any) { return d.y+2; });
  }

  private drag_start(): (d: any)=> void {
     return (d: any) => {
 if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
}

//make sure you can't drag the circle outside the box
private drag_drag(): (d: any)=> void  {
   return (d: any) => {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}
}

private drag_end(): (d: any)=> void  {
   return (d: any) => {
  if (!d3.event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
}

private zoom_actions():()=> void{
  return()=>{
    this.g.attr("transform", d3.event.transform)
  }
}


  private onMouseover(): (d: any, i:any) => void {
        return (d: any, i:any) => {
            d3.select(d3.event.currentTarget)
            .attr('fill', '#bab6b6')
            .style("cursor", "pointer");
            this.showDetail(d);
        }
   }
  private onclick(): (d: any, i:any) => void {
    this.showDetails =false;
    return (d: any, i:any) => { 
      d3.select(d3.event.currentTarget)
            .attr('fill', '#bab6b6')
            .style("cursor", "pointer");     
      this.player = d;
      this.showDetails =true;
          return;
     }
  }

  private dblclick(): (d: any, i:any) => void {
    this.showDetails =false;
    return (d: any, i:any) => {
            d3.select(d3.event.currentTarget)
              .style("cursor", "default")
              .attr('fill', (d: any) => { 
                  return this.fillColor(d.sacks); 
              });
           this.tt.style('opacity', 0.0);
        }
  }
  private showDetail(d: any) {
    d3.select(d3.event.currentTarget).attr('fill', '#bab6b6');
    var content = '<span class="name">Name: </span><span class="value">' +
      d.name +
      '</span><br/>' +    
      '<span class="name">Group: </span><span class="value">' +
      d.group +
      '</span>';
    this.tt.style('opacity', 1.0)
      .html(content);
    this.updatePosition(d3.event,this.tt);
  }
  private onMouseout(): (d: any, i:any) => void {
        return (d: any, i:any) => {
            d3.select(d3.event.currentTarget)
              .style("cursor", "default")
              .attr('fill', (d: any) => { 
                    if(d.type =="Centriod")
                    return "#bab6b6";      
                    return this.fillColor(d.sacks); 
              });
           this.tt.style('opacity', 0.0);
        }
   }
  public hideDetail(d: any) {
    this.tooltip.hideTooltip();
  } 
  public updatePosition(event: any,tip: any) {
    var xOffset = 20;
    var yOffset = 10;

    var ttw = this.tt.style('width');
    var tth = this.tt.style('height');

    var wscrY = window.scrollY;
    var wscrX = window.scrollX;

    var curX = (document.all) ? event.clientX + wscrX : event.pageX;
    var curY = (document.all) ? event.clientY + wscrY : event.pageY;
    var ttleft = ((curX - wscrX + xOffset * 2 + ttw) > window.innerWidth) ?
      curX - ttw - xOffset * 2 : curX + xOffset;

    if (ttleft < wscrX + xOffset) {
      ttleft = wscrX + xOffset;
    }

    var tttop = ((curY - wscrY + yOffset * 2 + tth) > window.innerHeight) ?
      curY - tth - yOffset * 2 : curY + yOffset;

    if (tttop < wscrY + yOffset) {
      tttop = curY + yOffset;
    }

    tip
      .style('top', tttop + 'px')
      .style('left', ttleft + 'px')
      .style('border-radius','5px')
        .style('border',' 2px solid #000')
        .style('background','#fff')
        .style('opacity','.9')
        .style('color','black')
        .style('padding','10px')
        .style('width','200px')
        .style('font-size','12px')
        .style('z-index',10)   
        .style('position','absolute') 
      .attr('class','tooltip-circle');
  }
  public floatingTooltip(tooltipId: any, width: number) {
      this.tt = d3.select('#cluster-bubble')
        .append('div')
        .attr('class','tooltip-circle')
        .attr('id', tooltipId)
        .style('pointer-events', "none");

      if (width) {
        this.tt.style('width', width);
      }
      return {   
        updatePosition: this.updatePosition
      };
}

}
