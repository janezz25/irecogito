
HTMLWidgets.widget({
  name: 'annotoriousopenseadragon',
  type: 'output',
  factory: function(el, width, height) {
    var viewer = OpenSeadragon({
      id: el.id,
      prefixUrl: "openseadragon-2.4.2/images/",
      gestureSettingsTouch: {
        pinchRotate: true
      },
      showRotationControl: false,
      showFlipControl: false,
      constrainDuringPan: true,
    });
    var anno = OpenSeadragon.Annotorious(viewer, {
      image: el.id,
      locale: 'auto',
      allowEmpty: true,
      formatter: Annotorious.ShapeLabelsFormatter()
    });
    
    // dodamo se ostale moznosti oznacevanja
    Annotorious.SelectorPack(anno, {
      tools: ['freehand','point']
    });
    
    Annotorious.Toolbar(anno, el.id, document.getElementById(el.id.concat("-outer-container")));
    Annotorious.BetterPolygon(anno);
    
    // Default to rectangle annotation
    anno.setDrawingTool('rect');
    
    
    
    return {
      renderValue: function(x) {
        // Quick selector widget showing buttons on top of the annotation widget
        var tagSelectorWidget = function(args) {
          // Triggers callbacks on user action
          var addTag = function(evt) {
            args.onAppendBody({
              type: 'TextualBody',
              purpose: 'tagging',
              value: evt.target.dataset.tag
            });
          };
          // Render the top buttons on top of the widget, using default shiny btn btn-default classes
          var createButton = function(value) {
            var button = document.createElement('button');
            button.className = "btn btn-default";
            button.dataset.tag = value;
            button.textContent = value;
            button.addEventListener('click', addTag);
            return button;
          };
          var container = document.createElement('div');
          container.className = 'tagset-quickselector-widget';
          tagset = x.tags;
          
          for (let i = 0; i < tagset.length; i++) {
            container.appendChild(createButton(tagset[i]));
          }
          return container;
        };
        if (x.tags === null){
          anno.widgets = [
            { widget: 'COMMENT' },
            { widget: 'TAG' }
          ];
        }else{
          if(x.quickselector === true){
            anno.widgets = [
              tagSelectorWidget,
              { widget: 'COMMENT' },
              { widget: 'TAG', vocabulary: x.tags }
            ];
          }else{
            anno.widgets = [
              { widget: 'COMMENT' },
              { widget: 'TAG', vocabulary: x.tags }
            ];
          }
        }
        anno.clearAnnotations();
        Shiny.setInputValue(x.inputId, JSON.stringify(anno.getAnnotations()));
        
        viewer.open({
            type: "image",
            url: x.src
          });
        
        anno.on('createAnnotation', function(a) {
          Shiny.setInputValue(x.inputId, JSON.stringify(anno.getAnnotations()));
        });
        anno.on('updateAnnotation', function(a) {
          Shiny.setInputValue(x.inputId, JSON.stringify(anno.getAnnotations()));
        });
        anno.on('deleteAnnotation', function(a) {
          Shiny.setInputValue(x.inputId, JSON.stringify(anno.getAnnotations()));
        });
        
        // add annotations in format of W3C WebAnnotation model 
        if(x.addAnnotations !== null){
          var annots = x.addAnnotations;
          for (let i = 0; i < annots.length; i++) { 
            anno.addAnnotation(JSON.parse(annots[i]));
          };
          //anno.addAnnotation(x.addAnnotations);
          Shiny.setInputValue(x.inputId, JSON.stringify(anno.getAnnotations()));
        }; 
        //anno.refresh();
        
      },
      resize: function(width, height) {
      },
      
      s: anno
      
    };
  }
});
